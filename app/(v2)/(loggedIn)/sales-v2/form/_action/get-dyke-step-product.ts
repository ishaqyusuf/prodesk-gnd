"use server";

import { prisma } from "@/db";
import { DykeProductMeta } from "../../type";

export async function getMouldingStepProduct(specie) {
    const stepProducts = await prisma.dykeStepProducts.findMany({
        where: {
            product: {
                category: {
                    title: "Moulding",
                },
            },
        },
        include: {
            product: true,
        },
    });
    const prods = stepProducts
        .filter((s) => {
            let meta = s.product.meta as any as DykeProductMeta;
            return meta.mouldingSpecies[specie];
        })
        .map((sp) => {
            return {
                ...sp,
                product: {
                    ...sp.product,
                    meta: (sp.product.meta || {}) as any as DykeProductMeta,
                },
            };
        });
    return prods;
}
export async function getStepProduct(stepId) {
    const tag = `dyke-step-product-${stepId}`;
    const stepProducts = await prisma.dykeStepProducts.findMany({
        where: {
            dykeStepId: stepId,
        },
        include: {
            product: true,
        },
    });
    const prods = stepProducts
        .filter(
            (_, i) =>
                stepProducts.findIndex(
                    (p) =>
                        p.dykeProductId == _.dykeProductId ||
                        p.product?.title == _.product?.title
                ) == i
        )
        .map((product) => {
            return {
                ...product,
                product: {
                    ...product.product,
                    meta: (product.product.meta ||
                        {}) as any as DykeProductMeta,
                },
            };
        });

    // console.log(prods);

    return prods;
}
