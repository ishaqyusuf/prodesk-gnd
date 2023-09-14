"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
export interface InboundOrderableItemQueryParamProps
  extends Omit<BaseQuery, "_show"> {
  salesOrderItemIds?: number[];
  _show?: "paid" | "all";
}
export async function getOrderableItems(
  query: InboundOrderableItemQueryParamProps
) {
  const where = buildQuery(query);
  const items = await prisma.salesOrderItems.findMany({
    where,
    include: {
      salesOrder: {
        include: {
          customer: true,
        },
      },
    },
    ...(await queryFilter(query)),
  });
  const pageInfo = await getPageInfo(query, where, prisma.salesOrderItems);
  return {
    pageInfo,
    data: items as any,
  };
}
function buildQuery(query: InboundOrderableItemQueryParamProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.SalesOrderItemsWhereInput = {
    prodStartedAt: null,
    swing: {
      not: null,
    },
    prodStatus: {
      not: "Completed",
    },
  };
  // if (query.salesOrderItemIds)
  //   where.inboundOrderItemId = {
  //     in: query.salesOrderItemIds,
  //   };
  switch (query._show) {
    case "paid":
      where.salesOrder = {
        amountDue: 0,
      };
      break;
  }
  return where;
}
export async function getOrderableItemsCount() {
  const count = await prisma.salesOrderItems.count({
    where: {
      prodStartedAt: null,
      swing: {
        not: null,
      },
      prodStatus: {
        not: "Completed",
      },
      salesOrder: {
        amountDue: 0,
      },
    },
  });
  return count;
}
