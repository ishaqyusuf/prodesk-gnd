"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface CustomerServiceQueryParamsProps extends BaseQuery {
  _show: "scheduled" | "incomplete" | "completed";
}
export async function getCustomerServices(
  query: CustomerServiceQueryParamsProps
) {
  const where = whereCustomerService(query);
  const items = await prisma.workOrders.findMany({
    where,
    include: {
      tech: true,
    },
    ...(await queryFilter(query)),
  });

  const pageInfo = await getPageInfo(query, where, prisma.workOrders);

  return {
    pageInfo,
    data: items as any,
  };
}
function whereCustomerService(query: CustomerServiceQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.WorkOrdersWhereInput = {};
  if (query._userId) where.techId = query._userId;
  return where;
}
