import { AsyncFnType, PageBaseQuery } from "@/app/(clean-code)/type";
import {
    DykeDoorType,
    SalesItemMeta,
    SalesMeta,
    SalesType,
    TypedAddressBook,
} from "../../types";
import { getPageInfo, pageQueryFilter } from "../../../_common/utils/db-utils";
import { prisma } from "@/db";
import {
    SalesListInclude,
    SalesOverviewIncludes,
    whereSales,
} from "../utils/db-utils";
import { salesOrderDto, salesQuoteDto } from "./dto/sales-list-dto";
import { salesItemsOverviewDto } from "./dto/sales-item-dto";

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
export type GetFullSalesDataDta = AsyncFnType<typeof getFullSalesDataDta>;
export async function getFullSalesDataDta(slug, type) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            type,
            slug,
        },
        include: SalesOverviewIncludes,
    });
    const shippingAddress = {
        ...(sale.shippingAddress || {}),
    } as any as TypedAddressBook;
    const billingAddress = {
        ...(sale.billingAddress || {}),
    } as any as TypedAddressBook;
    return {
        ...sale,
        items: sale.items.map(({ meta, ...rest }) => ({
            ...rest,
            meta: meta as any as SalesItemMeta,
            housePackageTool: rest.housePackageTool
                ? {
                      ...rest.housePackageTool,
                      doorType: rest.housePackageTool.doorType as DykeDoorType,
                  }
                : null,
        })),
        type: sale.type as SalesType,
        meta: sale.meta as any as SalesMeta,
        shippingAddress,
        billingAddress,
    };
}

export type GetSalesItemOverviewDta = AsyncFnType<
    typeof getSalesItemOverviewDta
>;
export async function getSalesItemOverviewDta(slug, type) {
    const data = await getFullSalesDataDta(slug, type);
    const resp = salesItemsOverviewDto(data);
    return {
        itemGroup: resp,
    };
}
