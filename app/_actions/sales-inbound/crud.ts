"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface InboundOrderQueryParamsProps extends BaseQuery {}
export async function getInboundOrders(query: InboundOrderQueryParamsProps) {
  const where = whereInboundOrder(query);
  const items = await prisma.inboundOrders.findMany({
    where,
    ...(await queryFilter(query)),
  });

  const pageInfo = await getPageInfo(query, where, prisma.inboundOrders);

  return {
    pageInfo,
    data: items as any,
  };
}
function whereInboundOrder(query: InboundOrderQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.InboundOrdersWhereInput = {};
  return where;
}
