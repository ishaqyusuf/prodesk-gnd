"use server";

import { prisma } from "@/db";
import { whereQuery } from "@/lib/db-utils";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";

interface PutawayQueryParams extends BaseQuery {}
export async function getPutwaysAction(query: PutawayQueryParams) {
  if (!query.status) query.status = "Arrived Warehouse";
  const where = wherePutaway(query);
  const items = await prisma.inboundOrderItems.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      InboundOrder: true,
      salesOrderItems: true,
    },
  });
  const pageInfo = await getPageInfo(query, where, prisma.inboundOrderItems);
  return {
    pageInfo,
    data: items as any,
  };
}
function wherePutaway(query: PutawayQueryParams) {
  const queryBuilder = whereQuery<Prisma.InboundOrderItemsWhereInput>(query);
  queryBuilder.register("status", query.status);
  queryBuilder.search({
    salesOrderItems: {
      OR: [
        {
          description: queryBuilder.q,
        },
        {
          salesOrder: {
            OR: [
              {
                orderId: queryBuilder.q,
              },
              {
                customer: {
                  name: queryBuilder.q,
                },
              },
            ],
          },
        },
      ],
    },
  });
  return queryBuilder.get();
}
