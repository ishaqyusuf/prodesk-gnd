import { AsyncFnType, PageBaseQuery } from "@/app/(clean-code)/type";
import { SalesMeta, SalesType, TypedAddressBook } from "../../types";
import { getPageInfo, pageQueryFilter } from "../../../_common/utils/db-utils";
import { prisma } from "@/db";
import {
    SalesIncludeAll,
    SalesListInclude,
    whereSales,
} from "../utils/db-utils";
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
    console.log(">>>>");
    const resp = await getSalesListDta(query);
    console.log(">>>>");

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
export type GetFullSalesDataDta = AsyncFnType<typeof getFullSalesDataDta>;
export async function getFullSalesDataDta(slug, type) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            type,
            slug,
        },
        include: SalesIncludeAll,
    });
    const shippingAddress = {
        ...(sale.shippingAddress || {}),
    } as any as TypedAddressBook;
    const billingAddress = {
        ...(sale.billingAddress || {}),
    } as any as TypedAddressBook;
    return {
        ...sale,
        type: sale.type as SalesType,
        meta: sale.meta as any as SalesMeta,
        shippingAddress,
        billingAddress,
    };
}
