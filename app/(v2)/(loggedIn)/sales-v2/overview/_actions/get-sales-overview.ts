"use server";

import { prisma } from "@/db";
import { IOrderType } from "@/types/sales";
import { redirect } from "next/navigation";

export async function getSalesOverview({
    type,
    slug,
    dyke,
}: {
    slug: string;
    type: IOrderType;
    dyke?: boolean;
}) {
    const order = await prisma.salesOrders.findFirst({
        where: {
            type,
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
    if (!order) redirect("");
    type Order = typeof order;
    const housePakageTools: {
        [doorType: string]: {
            type: string;
            housePackageTools: NonNullable<
                Order["items"][0]["housePackageTool"]
            >[];
        };
    } = {};
    const shelfItems: NonNullable<Order["items"][0]["shelfItems"]> = [];
    let totalDoors = 0;
    order.items.map((item) => {
        if (item.housePackageTool) {
            const tool = item.housePackageTool;
            const dt = tool.doorType as string;
            if (!housePakageTools[dt])
                housePakageTools[dt] = { type: dt, housePackageTools: [] };

            housePakageTools[dt]?.housePackageTools?.push(
                item.housePackageTool
            );
            totalDoors += item.housePackageTool?.totalDoors || 0;
        }
        if (item.shelfItems) shelfItems.push(...item.shelfItems);
    });
    const resp = {
        ...order,
        type: order.type as IOrderType,
        doors: Object.values(housePakageTools),

        shelfItems,
        totalDoors,
    };
    return resp;
}
