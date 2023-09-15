"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";
import { IInboundOrder, IInboundOrderItems } from "@/types/sales-inbound";
import { transformData } from "@/lib/utils";
import { nextId } from "@/lib/nextId";
import dayjs from "dayjs";

export interface InboundOrderQueryParamsProps extends BaseQuery {}
export async function getInboundOrders(query: InboundOrderQueryParamsProps) {
  const where = whereInboundOrder(query);
  const items = await prisma.inboundOrders.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      inboundItems: true,
    },
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
export async function createInboundOrder(
  data: IInboundOrder,
  items: IInboundOrderItems[]
) {
  const now = dayjs();
  const orderId = [
    "INB",
    now.format("YY"),
    now.format("MMDD"),
    await nextId(prisma.inboundOrders),
  ].join("-");
  const order = await prisma.inboundOrders.create({
    data: {
      ...transformData(data),
      orderId,
      slug: orderId,
      inboundItems: {
        createMany: {
          data: items.map((item) => {
            return transformData(item);
          }) as any,
        },
      },
    },
  });
  return order;
}
