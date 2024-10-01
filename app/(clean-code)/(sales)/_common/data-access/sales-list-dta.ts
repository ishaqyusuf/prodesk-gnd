import { AsyncFnType, PageBaseQuery } from "@/app/(clean-code)/type";
import { SalesType } from "../../types";
import { getPageInfo, pageQueryFilter } from "../../../_common/utils/db-utils";
import { prisma } from "@/db";
import { SalesListInclude, whereSales } from "../utils/db-utils";
import { salesOrderDto, salesQuoteDto } from "./dto/sales-list-dto";

export interface GetSalesListQuery extends PageBaseQuery {
    _type?: SalesType;
    dealerId?;
}
export type GetSalesQuotesDta = AsyncFnType<typeof getSalesQuotesDta>;
export async function getSalesQuotesDta(query: GetSalesListQuery) {
    const resp = await getSalesListDta(query);
    return {
        ...resp,
        data: resp.data.map(salesQuoteDto),
    };
}
export type GetSalesOrdersDta = AsyncFnType<typeof getSalesOrdersDta>;
export async function getSalesOrdersDta(query: GetSalesListQuery) {
    const resp = await getSalesListDta(query);
    return {
        ...resp,
        data: resp.data.map(salesOrderDto),
    };
}

export type GetSalesListDta = AsyncFnType<typeof getSalesListDta>;
export async function getSalesListDta(query: GetSalesListQuery) {
    const where = whereSales(query);
    const data = await prisma.salesOrders.findMany({
        where,
        ...pageQueryFilter(query),
        include: SalesListInclude,
    });
    const pageInfo = await getPageInfo(query, where, prisma.salesOrders);
    return {
        pageCount: pageInfo.pageCount,
        pageInfo,
        data,
    };
}
