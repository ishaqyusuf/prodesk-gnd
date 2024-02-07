"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { IOrderType } from "@/types/sales";
import { Prisma } from "@prisma/client";

export interface SalesQueryParams extends BaseQuery {
    type: IOrderType;
}
export async function getSalesAction(query: SalesQueryParams) {
    return prisma.$transaction(async (tx) => {
        const where: Prisma.SalesOrdersWhereInput = {};
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.salesOrders,
            where
        );
        const data = await tx.salesOrders.findMany({
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
