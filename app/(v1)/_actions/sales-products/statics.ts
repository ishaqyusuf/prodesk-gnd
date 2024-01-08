"use server";

import { prisma } from "@/db";
import { uniqueBy } from "@/lib/utils";
import { _cache } from "../_cache/load-data";

export async function getStaticCategories() {
    return await _cache("product-categories", async () => {
        return uniqueBy(
            await prisma.inventoryProducts.findMany({
                distinct: ["category"],
                select: {
                    category: true,
                },
            }),
            "category"
        ).filter((f) => f.category);
    });
}
export async function getStaticProducts() {
    return await _cache("products", async () => {
        return await prisma.inventoryProducts.findMany({
            distinct: ["title"],
            select: {
                title: true,
                category: true,
                id: true,
            },
        });
    });
}
