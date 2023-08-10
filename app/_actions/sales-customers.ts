"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "./action-utils";

export interface IGetCustomerActionQuery {}
export async function getCustomersAction(query: IGetCustomerActionQuery) {
  const where: Prisma.CustomersWhereInput = {};
  const _items = await prisma.customers.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      _count: {
        select: {
          salesOrders: true,
        },
      },
    },
  });

  const pageInfo = await getPageInfo(query, where, prisma.customers);
  return {
    pageInfo,
    data: _items as any,
  };
}
