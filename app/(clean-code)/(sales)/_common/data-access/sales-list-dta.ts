import { AsyncFnType, PageBaseQuery } from "@/app/(clean-code)/type";
import { SalesType } from "../../types";
import { getPageInfo, pageQueryFilter } from "../../../_common/utils/db-utils";
import { SalesInclude, whereSales } from "../utils/sales-utils";
import { prisma } from "@/db";

export interface GetSalesListQuery extends PageBaseQuery {
    _type?: SalesType;
    dealerId?;
}
export async function getSalesQuotesDta(query: GetSalesListQuery) {
    const resp = await getSalesListDta(query);
    return salesQuoteDto(resp);
}
export async function getSalesOrdersDta(query: GetSalesListQuery) {
    const resp = await getSalesListDta(query);
    return salesOrderDto(resp);
}
function salesOrderDto(data: GetSalesListDta) {
    return data;
}
function salesQuoteDto(data: GetSalesListDta) {
    return data;
}
export type GetSalesListDta = AsyncFnType<typeof getSalesListDta>;
export async function getSalesListDta(query: GetSalesListQuery) {
    const where = whereSales(query);
    const data = await prisma.salesOrders.findMany({
        where,
        ...pageQueryFilter(query),
        include: SalesInclude,
    });
    const pageInfo = await getPageInfo(query, where, prisma.salesOrders);
    return {
        pageCount: pageInfo.pageCount,
        pageInfo,
        data,
    };
}
