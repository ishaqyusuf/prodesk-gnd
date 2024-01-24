"use server";

import { DykeProducts, DykeSteps } from "@prisma/client";
import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

export async function getNextDykeStepAction(
    step: DykeSteps,
    product: DykeProducts | null,
    nextStepId,
    _steps: any[] = []
) {
    if (product) {
        const customStep = await CustomStep(product, step.title);
        if (customStep) return [..._steps, customStep];
    }
    // if (step.title == 'House')
    const { stepValueId, rootStepValueId, prevStepValueId } = step;
    if (!nextStepId) {
        const nextSteps = await prisma.dykeSteps.findMany({
            where: {
                title: {
                    not: step.title,
                },
                rootStepValueId: rootStepValueId || 1,
                prevStepValueId: !stepValueId ? null : stepValueId,
            },
        });
        nextStepId = nextSteps[0]?.id;
        if (nextSteps.length > 1) {
            console.log(nextSteps);
            nextSteps.map((s) => {
                if (
                    (product?.title && s.value?.endsWith(product.title)) ||
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
    }
    if (nextStepId) {
        const stepForm = await getStepForm(nextStepId);
        const stepProd = stepForm.step?.stepProducts?.[0];
        if (autoStep(stepForm.step?.title)) {
            if (hiddenSteps(stepForm.step?.title)) {
                stepForm.item.meta.hidden = true;
                stepForm.item.stepId = stepForm.step?.id as any;

                return await getNextDykeStepAction(
                    stepForm.step as any,
                    null,
                    stepProd?.nextStepId,
                    [..._steps, stepForm]
                );
            }
            if (stepForm.step?.stepProducts.length == 1 && stepProd) {
                stepForm.item.value =
                    stepProd?.product.title || stepProd?.product.value;
                stepForm.item.stepId = stepProd.dykeStepId;
                return await getNextDykeStepAction(
                    stepForm.step as any,
                    stepProd?.product as any,
                    stepProd?.nextStepId,
                    [..._steps, stepForm]
                );
            }
        }
        return [..._steps, stepForm];
    } else {
    }
    return null;
}
function hiddenSteps(title) {
    return [
        "width",
        "hand",
        "casing 1x4 setup",
        "jamb stop",
        "rip jamb",
    ].includes(title?.toLowerCase());
}
function autoStep(title) {
    return !["Shelf Items", "House Package Tool", "Door"].includes(title);
}
async function CustomStep({ title: productTitle }, stepTitle) {
    const customSteps = {
        "Shelf Items": "Shelf Items",
        "Cutdown Height": "House Package Tool",
    };
    let title = customSteps[productTitle] || customSteps[stepTitle];

    // if(!title && stepTitle != 'Shelf')
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
