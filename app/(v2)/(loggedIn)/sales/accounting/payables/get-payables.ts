"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export default async function getPayablesAction(query) {
    return prisma.$transaction(async (tx) => {
        const where: Prisma.SalesOrdersWhereInput = {
            amountDue: {
                gt: 0,
            },
        };
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.salesOrders,
            where
        );
        const data = await tx.salesOrders.findMany({
            where,
            skip,
            take,
            include: {
                customer: true,
            },
        });
        return {
            data,
            pageCount,
        };
    });
}
