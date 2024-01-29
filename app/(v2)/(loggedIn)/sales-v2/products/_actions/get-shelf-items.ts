"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";

interface QueryProps extends BaseQuery {}
export async function getShelfItems(query: QueryProps) {
    return prisma.$transaction(async (tx) => {
        const where: Prisma.DykeShelfProductsWhereInput = {};
        if (query._q) where.OR = [{ title: { contains: query._q } }];
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.dykeShelfProducts,
            where
        );
        const data = await tx.dykeShelfProducts.findMany({
            where,
            skip,
            take,
            include: {
                category: true,
            },
        });
        return {
            data,
            pageCount,
        };
    });
}
