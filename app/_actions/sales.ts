"use server";

import {
  dateQuery,
  getPageInfo,
  queryFilter,
} from "@/app/_actions/action-utils";
import { prisma } from "@/db";
import { ActionResponse } from "@/types/action";
import { ISalesOrder, SalesQueryParams } from "@/types/sales";
import { Prisma } from "@prisma/client";

async function whereSales(query: SalesQueryParams) {
  const {
    _q,
    _dateType = "createdAt",
    status,
    date,
    from,
    to,
    prodId,
    type = "order",
  } = query;
  const inputQ = { contains: _q || undefined };
  const where: Prisma.SalesOrdersWhereInput = {
    OR: [
      { orderId: inputQ },
      {
        customer: {
          name: inputQ,
        },
      },
    ],
    type,
    ...dateQuery({ from, to, _dateType, date }),
  };
  if (prodId) where.prodId = prodId;
  if (status) {
    const statusIsArray = Array.isArray(status);
    where.prodStatus = {
      equals: statusIsArray ? undefined : status,
      in: statusIsArray ? status : undefined,
    };
  }
  if (query._page == "production") {
    if (!prodId)
      where.prodId = {
        gt: 0,
      };
  }
  return where;
}
export async function getSalesOrder(
  query: SalesQueryParams
): ActionResponse<ISalesOrder> {
  query.type = "order";

  const where = whereSales(query);
  const _items = await prisma.salesOrders.findMany({
    ...(await queryFilter(query)),
    include: {
      customer: true,
      producer: true,
      salesRep: true,
    },
  });
  const pageInfo = await getPageInfo(query, where, prisma.salesOrders);
  return {
    pageInfo,
    data: _items as any,
  };
}
