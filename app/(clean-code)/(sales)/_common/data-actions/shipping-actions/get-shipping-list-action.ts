"use server";

import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { AsyncFnType } from "@/types";
import { whereDispatch } from "../../utils/db-utils";
import { prisma } from "@/db";
import {
    inifinitePageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { generateDispatchId } from "../../utils/dispatch-utils";

export type GetShippingListPage = AsyncFnType<typeof getShippingListPageAction>;
export type GetShippingList = AsyncFnType<typeof getShippingListAction>;
export type ShippingListItem = ReturnType<typeof transformShippingList>;
export async function getShippingListAction(query: SearchParamsType) {
    const where = whereDispatch(query);
    const data = await prisma.orderDelivery.findMany({
        where,
        ...pageQueryFilter(query),
        select: {
            createdAt: true,
            id: true,
            status: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
            deliveryMode: true,
            driver: {
                select: { id: true, name: true },
            },
            order: {
                select: {
                    orderId: true,
                    id: true,
                },
            },
        },
    });
    return data;
}
function transformShippingList(item: GetShippingList[number]) {
    // item.assignments;
    return {
        ...item,
        dispatchId: generateDispatchId(item.id),
        deliveryMode: item.deliveryMode as "pickup" | "delivery",
    };
}
export async function getShippingListPageAction(query: SearchParamsType) {
    const data = await getShippingListAction(query);
    const result = await inifinitePageInfo(
        query,
        whereDispatch(query),
        prisma.orderDelivery,
        data.map(transformShippingList)
    );
    return result;
}

export type GetSalesShippingInfoAction = AsyncFnType<
    typeof getSalesShippingInfoAction
>;
export async function getSalesShippingInfoAction(salesId) {}
