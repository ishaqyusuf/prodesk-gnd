"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { getSales } from "@/data-acces/sales";
import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { DeliveryOption, ISalesType } from "@/types/sales";
import { Prisma } from "@prisma/client";

export interface SalesQueryParams extends BaseQuery {
    type: ISalesType;
    deliveryOption: DeliveryOption;
}

export type GetSalesAction = Awaited<ReturnType<typeof getSalesAction>>;
export async function getSalesAction(query: SalesQueryParams) {
    // return prisma.$transaction(async (tx) => {
    return await getSales(query);
    const where: Prisma.SalesOrdersWhereInput = {};
    const { pageCount, skip, take } = await paginatedAction(
        query,
        prisma.salesOrders,
        where
    );
    const data = await prisma.salesOrders.findMany({
        where,
        skip,
        take,
        include: {
            customer: true,
            shippingAddress: true,
            billingAddress: true,
            salesRep: true,
            pickup: true,
        },
    });
    return {
        data,
        pageCount,
    };
    // });
}
