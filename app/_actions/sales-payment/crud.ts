"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface salesPaymentsQueryParamsProps extends BaseQuery {}
export async function getsalesPayments(query: salesPaymentsQueryParamsProps) {
  const where = wheresalesPayments(query);
  const items = await prisma.salesPayments.findMany({
    where,
    include: {
      customer: true,
    },
    ...(await queryFilter(query)),
  });

  const pageInfo = await getPageInfo(query, where, prisma.salesPayments);

  return {
    pageInfo,
    data: items as any,
  };
}
function wheresalesPayments(query: salesPaymentsQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.SalesPaymentsWhereInput = {};
  return where;
}
