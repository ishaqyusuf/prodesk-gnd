"use server";

import { prisma } from "@/db";
import { DykeProductMeta, StepProdctMeta } from "../../type";

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
            return meta?.mouldingSpecies?.[specie] || false;
        })
        .map((sp) => {
            return {
                ...sp,
                product: {
                    ...sp.product,
                    meta: (sp.product.meta || {}) as any as DykeProductMeta,
                },
                _estimate: {
                    price: null,
                },
            };
        });
    return prods;
}
export async function getSlabDoorTypes() {
    const p = await prisma.dykeProducts.findFirst({
        where: {
            title: "HC Molded",
        },
        include: {
            stepProducts: true,
        },
    });

    return await getStepProduct(p?.stepProducts?.[0]?.dykeStepId);
}
export async function getStepProduct(stepId, doorType?) {
    const tag = `dyke-step-product-${stepId}`;
    const stepProducts = await prisma.dykeStepProducts.findMany({
        where: {
            dykeStepId: stepId,
        },
        include: {
            product: true,
        },
    });
    let prods = stepProducts
        .filter(
            (_, i) =>
                stepProducts.findIndex(
                    (p) =>
                        p.dykeProductId == _.dykeProductId ||
                        p.product?.title == _.product?.title
                ) == i
        )
        .map((stepProduct) => {
            // stepProduct.
            return {
                ...stepProduct,
                meta: (stepProduct.meta || {
                    stepSequence: [],
                }) as any as StepProdctMeta,
                product: {
                    ...stepProduct.product,
                    meta: (stepProduct.product.meta ||
                        {}) as any as DykeProductMeta,
                },
                _estimate: {
                    price: null,
                },
            };
        });
    if (prods.filter((s) => s.sortIndex >= 0).length)
        prods = prods.sort((a, b) => a.sortIndex - b.sortIndex);
    // console.log(prods);
    return prods;
}
