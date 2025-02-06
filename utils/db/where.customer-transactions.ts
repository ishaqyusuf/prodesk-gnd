import { composeQuery } from "@/app/(clean-code)/(sales)/_common/utils/db-utils";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { Prisma } from "@prisma/client";

export function whereCustomerTx(query: SearchParamsType) {
    const whereAnd: Prisma.CustomerTransactionWhereInput[] = [
        {
            salesPayments: {
                some: {
                    order: {},
                },
            },
        },
    ];
    return composeQuery(whereAnd);
}
