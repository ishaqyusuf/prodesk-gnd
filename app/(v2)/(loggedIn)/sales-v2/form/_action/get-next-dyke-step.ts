"use server";

import { DykeProducts, DykeSteps } from "@prisma/client";
import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

export async function getNextDykeStepAction(
    step: DykeSteps,
    product: DykeProducts
) {
    const customStep = await CustomStep(product);
    if (customStep) return customStep;
    // if (step.title == 'House')
    const { stepValueId, rootStepValueId, prevStepValueId } = step;
    const nextSteps = await prisma.dykeSteps.findMany({
        where: {
            title: {
                not: step.title,
            },
            rootStepValueId: rootStepValueId || 1,
            prevStepValueId: !stepValueId ? null : stepValueId,
        },
    });
    let nextStepId: any = nextSteps[0]?.id;
    if (nextSteps.length > 1) {
        console.log(nextSteps);
        nextSteps.map((s) => {
            if (
                (product.title && s.value?.endsWith(product.title)) ||
                (s.title == "Hand" && s.id == 22)
            ) {
                console.log({
                    product,
                    s,
                });
                nextStepId = s.id;
            }
        });
    }

    if (nextStepId) return await getStepForm(nextStepId);
    else {
    }
    return null;
}
async function CustomStep({ title: productTitle }) {
    const customSteps = {
        "Shelf Items": "Shelf Items",
        "Cutdown Height": "House Package Tool",
    };
    const title = customSteps[productTitle];
    if (title) {
        let step = await prisma.dykeSteps.findFirst({
            where: {
                title,
            },
        });
        if (!step)
            step = await prisma.dykeSteps.create({
                data: {
                    title,
                },
            });
        return await getStepForm(step.id);
    }
}
