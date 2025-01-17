"use server";

import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { AsyncFnType } from "@/types";
import { whereSales } from "../utils/db/where.sales";
import {
    getPageInfo,
    inifinitePageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { SalesProductionListSelect } from "../contants/sales-includes";
import { Prisma } from "@prisma/client";
import { dueDateAlert } from "../utils/production-utils";

export type GetProductionListPage = AsyncFnType<
    typeof getProductionListPageAction
>;
export type GetProductionList = AsyncFnType<typeof getProductionListAction>;
export async function getProductionListPageAction(query: SearchParamsType) {
    const prodList = await getProductionListAction(query);
    const dueToday = !query.start
        ? await getProductionListAction({
              "sales.type": query["sales.type"],
              "production.assignedToId": query["production.assignedToId"],
              "production.status": "due today",
          })
        : [];
    const pastDue = !query.start
        ? await getProductionListAction({
              "sales.type": query["sales.type"],
              "production.assignedToId": query["production.assignedToId"],
              "production.status": "past due",
          })
        : [];
    const excludesIds = [...dueToday, ...pastDue].map((a) => a.id);
    const others = prodList.filter((p) => !excludesIds?.includes(p.id));

    const result = await inifinitePageInfo(
        query,
        whereSales(query),
        prisma.salesOrders,
        [...dueToday, ...pastDue, ...others].map(transformProductionList)
    );
    return result;
}
export async function getProductionListAction(query: SearchParamsType) {
    const where = whereSales(query);

    const whereAssignments: Prisma.OrderItemProductionAssignmentsWhereInput[] =
        (
            Array.isArray(where?.AND)
                ? where.AND?.map((a) => a.assignments?.some).filter(Boolean)
                : where?.assignments
                ? [where?.assignments]
                : []
        ) as any;
    const data = await prisma.salesOrders.findMany({
        where,
        ...pageQueryFilter(query),

        select: {
            id: true,
            orderId: true,
            salesRep: {
                select: { name: true },
            },
            assignments: {
                where: {
                    deletedAt: null,
                    AND:
                        whereAssignments?.length > 1
                            ? whereAssignments
                            : undefined,
                    ...(whereAssignments?.length == 1
                        ? whereAssignments[0]
                        : {}),
                },
                select: {
                    lhQty: true,
                    rhQty: true,
                    dueDate: true,
                    assignedTo: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return data;
}
function transformProductionList(item: GetProductionList[number]) {
    // item.assignments;
    const dueDate = item.assignments.map((d) => d.dueDate).filter(Boolean);

    const alert = dueDateAlert(dueDate);
    return {
        orderId: item.orderId,
        alert,
        salesRep: item?.salesRep?.name,
        assignedTo: Array.from(
            new Set(item.assignments.map((a) => a.assignedTo?.name))
        ).join(" & "),
        uuid: item.orderId,
        id: item.id,
    };
}
