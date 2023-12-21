"use server";

import { prisma } from "@/db";

export async function getShelfProducts(parentCategoryId, categoryId) {
    const subCategoriesCount = await prisma.dykeShelfCategories.count({
        where: {
            parentCategoryId,
            categoryId,
        },
    });
    console.log(subCategoriesCount);
    const products = subCategoriesCount
        ? []
        : await prisma.dykeShelfProducts.findMany({
              where: {
                  categoryId,
                  parentCategoryId,
              },
          });
    return { subCategoriesCount, products };
}
