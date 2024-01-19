"use server";

import { prisma } from "@/db";
import { dykeInteriors, dykeStepValues } from "@/lib/data/dyke-interiors";
import { chunkArray } from "@/lib/utils";

export async function dykeBootstrapAction() {
    const data = dykeInteriors;

    await prisma.$transaction(async (tx) => {
        await Promise.all(
            [
                tx.dykeStepProducts,
                tx.dykeCategories,
                tx.dykeProducts,
                tx.dykeSteps,
                tx.dykeStepValues,
            ].map(async (d) => {
                if (d) await (d as any).deleteMany({});
            })
        );
        // return;
        await tx.dykeStepValues.createMany({
            data: data.stepValues.filter((c) => c.id),
        });
        await tx.dykeCategories.createMany({
            data: data.categories.filter((c) => c.id),
        });
        await tx.dykeProducts.createMany({
            data: data.products.map((product) => {
                return product;
            }),
        });
        await Promise.all(
            chunkArray(data.steps, Math.floor(data.steps.length / 10)).map(
                async (steps) => {
                    await tx.dykeSteps.createMany({
                        data: steps.map((s) => {
                            return s;
                        }),
                    });
                }
            )
        );
        await Promise.all(
            chunkArray(
                data.stepProducts,
                Math.floor(data.stepProducts.length / 10)
            ).map(async (prods) => {
                await tx.dykeStepProducts.createMany({
                    data: prods.map((prod) => {
                        return {
                            id: prod.id,
                            dykeProductId: prod.productId,
                            dykeStepId: prod.stepId,
                        };
                    }),
                });
            })
        );
        // await tx.dykeStepProducts.createMany({
        //     data: data.stepProducts.map((prod) => {
        //         return {
        //             id: prod.id,
        //             dykeProductId: prod.productId,
        //             dykeStepId: prod.stepId,
        //         };
        //     }),
        // });
    });
}
