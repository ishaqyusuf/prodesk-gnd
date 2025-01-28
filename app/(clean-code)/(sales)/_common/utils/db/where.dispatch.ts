import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { Prisma } from "@prisma/client";
import { composeQuery } from "../db-utils";

export function whereDispatch(query: SearchParamsType) {
    const wheres: Prisma.OrderDeliveryWhereInput[] = [];
    if (query["sales.id"])
        wheres.push({
            salesOrderId: query["sales.id"],
        });
    return composeQuery(wheres);
}
