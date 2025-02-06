import { composeQuery } from "@/app/(clean-code)/(sales)/_common/utils/db-utils";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { Prisma } from "@prisma/client";

export function whereSalesPayments(query: SearchParamsType) {
    const whereAnd: Prisma.CustomerTransactionWhereInput[] = [];
    return composeQuery(whereAnd);
}
