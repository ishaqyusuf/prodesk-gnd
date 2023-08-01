"use server";

import { prisma } from "@/db";
import { InventoryComponentCategory } from "@/types/sales";
import { Prisma } from "@prisma/client";

export interface ISearchQuery {
  category?: InventoryComponentCategory;
  q?;
  productId?;
}
export async function searchOrderInventoryAction(query: ISearchQuery) {
  const { q, category } = query;
  const where: Prisma.OrderInventoryWhereInput = {
    category,
  };

  if (q) {
    where.OR = [
      {
        description: {
          contains: q || undefined,
        },
      },
      {
        name: {
          contains: q || undefined,
        },
      },
    ];
  }
  const products = await prisma.orderInventory.findMany({
    take: 10,
    where,
    distinct: "name",
  });
  return products;
}
interface getComponentCostHistoryQuery {
  title;
  category: InventoryComponentCategory;
}
export async function getComponentCostHistoryAction(
  query: getComponentCostHistoryQuery
) {
  const { title, category } = query;
  const where: Prisma.OrderInventoryWhereInput = {
    category,
    name: title,
    price: {
      gt: 0,
    },
  };
  const products = await prisma.orderInventory.findMany({
    // take: 5,
    where,
    // select: {
    //     id:true,
    //     name: true,
    //     price: true
    // },
    distinct: ["price"],
    include: {
      product: true,
    },
  });
  console.log(products);
  return products;
}
