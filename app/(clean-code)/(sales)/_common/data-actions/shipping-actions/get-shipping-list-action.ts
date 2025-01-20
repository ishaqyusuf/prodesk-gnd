"use server";

import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { AsyncFnType } from "@/types";
import { whereDispatch } from "../../utils/db-utils";
import { prisma } from "@/db";
import {
    inifinitePageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";

export type GetShippingListPage = AsyncFnType<typeof getShippingListPageAction>;
export type GetShippingList = AsyncFnType<typeof getShippingListAction>;

export async function getShippingListAction(query: SearchParamsType) {
    const where = whereDispatch(query);
    const data = await prisma.orderDelivery.findMany({
        where,
        ...pageQueryFilter(query),
        select: {},
    });
    return data;
}
function transformShippingList(item: GetShippingList[number]) {
    // item.assignments;
    return item;
}
export async function getShippingListPageAction(query: SearchParamsType) {
    const data = await getShippingListAction(query);
    const result = await inifinitePageInfo(
        query,
        whereDispatch(query),
        prisma.orderDelivery,
        data.map(transformShippingList)
    );
}

export type GetSalesShippingInfoAction = AsyncFnType<
    typeof getSalesShippingInfoAction
>;
export async function getSalesShippingInfoAction(salesId) {}
