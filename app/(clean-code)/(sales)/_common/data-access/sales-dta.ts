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
import {
    salesItemGroupOverviewDto,
    salesOverviewDto,
} from "./dto/sales-item-dto";
import { salesShippingDto } from "./dto/sales-shipping-dto";
import { statMismatchDta } from "./sales-progress.dta";

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
export type GetFullSalesDataDta = AsyncFnType<typeof typedFullSale>;
export async function getFullSaleById(id) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id,
        },
        include: SalesOverviewIncludes,
    });
    return sale;
}
export async function getFullSaleBySlugType(slug, type) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            slug,
            type,
        },
        include: SalesOverviewIncludes,
    });
    return sale;
}
export function typedFullSale(sale: AsyncFnType<typeof getFullSaleById>) {
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
export async function getSalesItemOverviewDta(slug, type, retries = 0) {
    const sale = await getFullSaleBySlugType(slug, type);
    const data = typedFullSale(sale);
    const overview = salesOverviewDto(data);
    const resp = {
        ...overview,
        shipping: salesShippingDto(overview, data),
        retries,
    };
    if ((await statMismatchDta(resp)) && retries < 1) {
        console.log("mismatch");
        return await getSalesItemOverviewDta(slug, type, retries + 1);
    }
    if (retries > 0) console.log("mismatch fixed");
    else console.log("no mismatch");
    return resp;
}
