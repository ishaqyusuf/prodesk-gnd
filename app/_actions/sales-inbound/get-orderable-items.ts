"use server";

import { prisma } from "@/db";

export async function getOrderableItems() {
  const items = await prisma.salesOrderItems.findMany({
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
