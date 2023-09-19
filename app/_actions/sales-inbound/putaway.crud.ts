"use server";

import { prisma } from "@/db";
import { whereQuery } from "@/lib/db-utils";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";

interface PutawayQueryParams extends Omit<BaseQuery, "status"> {
  status: "All" | "Pending" | "Stored" | "Pending Arrival";
}
export async function getPutwaysAction(query: PutawayQueryParams) {
  // if (!query.status) query.status = "Arrived Warehouse";
  const where = wherePutaway(query);
  const items = await prisma.inboundOrderItems.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      InboundOrder: true,
      salesOrderItems: {
        include: {
          salesOrder: {
            select: {
              id: true,
              slug: true,
              orderId: true,
            },
          },
        },
      },
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
  // queryBuilder.register("status", query.status);

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
  queryBuilder.search({
    InboundOrder: {
      slug: queryBuilder.q,
    },
  });
  switch (query.status) {
    case "Pending":
      queryBuilder.raw({
        location: null,
        status: "Arrived Warehouse",
      });
      break;
    case "Pending Arrival":
      queryBuilder.raw({
        location: null,
        status: {
          not: "Arrived Warehouse",
        },
      });
      break;
    case "Stored":
      queryBuilder.raw({
        location: {
          not: null,
        },
      });
      break;
  }
  return queryBuilder.get();
}
export async function _updateInboundItemLocation(id, data) {
  await prisma.inboundOrderItems.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}
