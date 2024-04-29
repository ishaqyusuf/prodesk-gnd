"use server";

import { prisma } from "@/db";
import {
    ISalesType,
    ISalesOrderItemMeta,
    ISalesOrderMeta,
} from "@/types/sales";
import { composeSalesItems } from "../../_utils/compose-sales-items";
import { DykeDoorType } from "../../type";

export async function getSalesOverview({
    type,
    slug,
    dyke,
}: {
    slug: string;
    type: ISalesType;
    dyke?: boolean;
}) {
    const order = await viewSale(type, slug);

    const salesItems = composeSalesItems(order);
    const resp = {
        ...order,
        type: order.type as ISalesType,
        ...salesItems,
    };
    return resp;
}
export async function viewSale(type, slug) {
    const order = await prisma.salesOrders.findFirst({
        where: {
            type: type ? type : undefined,
            slug,
        },
        include: {
            items: {
                where: { deletedAt: null },
                include: {
                    shelfItems: {
                        where: { deletedAt: null },
                        include: {
                            shelfProduct: true,
                        },
                    },
                    formSteps: {
                        where: { deletedAt: null },
                        include: {
                            step: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                        },
                    },
                    housePackageTool: {
                        where: { deletedAt: null },
                        include: {
                            casing: true,
                            door: true,
                            jambSize: true,
                            doors: true,
                            molding: true,
                        },
                    },
                },
            },
            customer: true,
            shippingAddress: true,
            billingAddress: true,
            producer: true,
            salesRep: true,
            productions: true,
            payments: true,
        },
    });
    if (!order) throw Error();
    return {
        ...order,
        meta: order.meta as any as ISalesOrderMeta,
        items: order.items.map((item) => {
            // console.log(item.meta);
            return {
                ...item,
                housePackageTool: item.housePackageTool
                    ? {
                          ...item.housePackageTool,
                          doorType: item.housePackageTool
                              .doorType as DykeDoorType,
                      }
                    : null,
                meta: item.meta as any as ISalesOrderItemMeta,
            };
        }),
    };
}
