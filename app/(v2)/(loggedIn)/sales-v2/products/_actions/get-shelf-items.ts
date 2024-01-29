"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

interface QueryProps {}
export async function getShelfItems(query: QueryProps) {
    return prisma.$transaction(async (tx) => {
        const where: Prisma.DykeShelfProductsWhereInput = {};
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.dykeShelfProducts,
            where
        );
        const data = await tx.dykeShelfProducts.findMany({
            where,
            skip,
            take,
            include: {},
        });
        return {
            data,
            pageCount,
        };
    });
}
