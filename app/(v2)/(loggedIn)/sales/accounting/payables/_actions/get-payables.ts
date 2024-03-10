"use server";

import { dateQuery } from "@/app/(v1)/_actions/action-utils";
import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { wherePayableSalesOrders } from "./where";

export default async function getPayablesAction(query) {
    return prisma.$transaction(async (tx) => {
        const where = wherePayableSalesOrders(query);
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
