"use server";

import { prisma } from "@/db";
import {
    IOrderType,
    ISalesOrderItemMeta,
    ISalesOrderMeta,
} from "@/types/sales";
import { redirect } from "next/navigation";
import { composeSalesItems } from "../../_utils/compose-sales-items";

export async function getSalesOverview({
    type,
    slug,
    dyke,
}: {
    slug: string;
    type: IOrderType;
    dyke?: boolean;
}) {
    const order = await viewSale(type, slug);

    const salesItems = composeSalesItems(order);
    const resp = {
        ...order,
        type: order.type as IOrderType,
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
                include: {
                    shelfItems: {
                        include: {
                            shelfProduct: true,
                        },
                    },
                    formSteps: {
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
                        include: {
                            casing: true,
                            door: true,
                            jambSize: true,
                            doors: true,
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
            return {
                ...item,
                meta: item.meta as any as ISalesOrderItemMeta,
            };
        }),
    };
}
