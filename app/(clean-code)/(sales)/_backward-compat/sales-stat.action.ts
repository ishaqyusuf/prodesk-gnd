"use server";

import { prisma } from "@/db";
import { SalesIncludeAll } from "../_common/utils/db-utils";

export async function salesStatisticsAction() {
    //
    const sales = await prisma.salesOrders.findMany({
        where: {
            type: "order",
            stat: {
                none: {},
            },
        },
        include: SalesIncludeAll,
    });

    return {
        allSales: sales.length,
    };
}
