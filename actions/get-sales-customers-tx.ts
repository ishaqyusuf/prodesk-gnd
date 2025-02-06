"use server";

import {
    getPageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { AsyncFnType } from "@/types";
import { whereCustomerTx } from "@/utils/db/where.customer-transactions";

export type GetSalesCustomerTx = AsyncFnType<typeof getSalesCustomerTxAction>;

export async function getSalesCustomerTxAction(query: SearchParamsType) {
    const where = whereCustomerTx(query);
    const data = await prisma.customerTransaction.findMany({
        where,
        ...pageQueryFilter(query),
        select: {
            id: true,
            amount: true,
            createdAt: true,
            description: true,
            status: true,
            author: {
                select: {
                    name: true,
                    id: true,
                },
            },
            wallet: {
                select: {
                    accountNo: true,
                },
            },
            salesPayments: {
                select: {
                    order: {
                        select: {
                            orderId: true,
                            id: true,
                            salesRep: {
                                select: {
                                    name: true,
                                    id: true,
                                },
                            },
                        },
                    },
                },
            },
            // order: {
            //     select: {
            //         orderId: true,
            //         amountDue: true,
            //         grandTotal: true,
            //         salesRep: {
            //             select: {
            //                 name: true,
            //             },
            //         },
            //     },
            // },
        },
    });
    const pageInfo = await getPageInfo(
        query,
        where,
        prisma.customerTransaction
    );
    return {
        ...pageInfo,
        data: data.map((item) => {
            // item.amount = Math.abs(item.amount);
            // let amountDisplay = item.amount <= 0
            // ? `(${Math.abs(item.amount)})`
            return item;
        }),
    };
}
