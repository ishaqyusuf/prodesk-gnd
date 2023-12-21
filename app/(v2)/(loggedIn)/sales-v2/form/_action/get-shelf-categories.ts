"use server";

import { prisma } from "@/db";

export async function _getShelfCategories(categoryId, parentCategoryId) {
    const cats = await prisma.dykeShelfCategories.findMany({
        where: {
            categoryId,
            parentCategoryId,
        },
    });
    console.log(cats);
    return cats;
}
