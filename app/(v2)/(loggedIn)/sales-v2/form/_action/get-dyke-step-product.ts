"use server";

import { prisma } from "@/db";

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
    const prods = stepProducts.filter(
        (_, i) =>
            stepProducts.findIndex(
                (p) =>
                    p.dykeProductId == _.dykeProductId ||
                    p.product?.title == _.product?.title
            ) == i
    );

    console.log(prods);

    return prods;
}
