"use server";

import { dateQuery } from "@/app/(v1)/_actions/action-utils";
import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export default async function getPayablesAction(query) {
    return prisma.$transaction(async (tx) => {
        const whereDate = dateQuery({
            ...query,
            _dateType: "goodUntil",
        });
        const where: Prisma.SalesOrdersWhereInput = {
            amountDue: {
                gt: 0,
            },
            ...whereDate,
        };
        if (query._q) {
            //
            let numSearch = query._q;
            [">", ">=", "<", "<=", "="].map(
                (s) => (numSearch = numSearch?.replace(s, ""))
            );
            numSearch = Number(numSearch);
            if (numSearch >= 0) {
                let numS = "equals";

                if (query._q?.startsWith(">")) numS = "gt";
                where.amountDue = {
                    [numS]: numSearch,
                };
            } else {
                where.OR = [
                    {
                        orderId: query._q,
                    },
                    {
                        amountDue: {},
                    },
                ];
            }
        }
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
