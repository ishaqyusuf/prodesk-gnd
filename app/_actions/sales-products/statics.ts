"use server";

import { prisma } from "@/db";
import { uniqueBy } from "@/lib/utils";

export async function getStaticCategories() {
  return uniqueBy(
    await prisma.inventoryProducts.findMany({
      distinct: ["category"],
      select: {
        category: true,
      },
    }),
    "category"
  ).filter((f) => f.category);
}
export async function getStaticProducts() {
  return await prisma.inventoryProducts.findMany({
    distinct: ["title"],
    select: {
      title: true,
      category: true,
      id: true,
    },
  });
}
