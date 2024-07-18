"use server";

import { DykeProducts, DykeSteps } from "@prisma/client";
import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";
import { createDoorSpecies } from "./create-door-species";
import { DykeDoorType } from "../../type";

export async function getNextDykeStepAction(
    step: DykeSteps,
    product: DykeProducts | null,
    stepProd,
    _steps: any[] = [],
    doorType: DykeDoorType
) {
    // console.log(step);

    let nextStepId = stepProd?.nextStepId;
    if (product?.title == "Wood Stile & Rail") {
        nextStepId = await createDoorSpecies(step, stepProd);
        // console.log(product);
        stepProd.nextStepId = nextStepId;
    }
    if (product) {
        const customStep = await CustomStepForm(product, step.title, doorType);
        console.log({ customStep, product, step, doorType });

        if (customStep) return [..._steps, customStep];
    }
    // if (step.title == 'House')
    const { stepValueId, rootStepValueId, prevStepValueId } = step;
    if (!nextStepId) {
        // const path = await prisma.
        let nextSteps = await prisma.dykeSteps.findMany({
            where: {
                title: {
                    not: step.title,
                },
                rootStepValueId: rootStepValueId || 1,
                prevStepValueId: !stepValueId ? null : stepValueId,
            },
        });
        if (!nextSteps.length && step.title == "Door Species") {
            nextSteps = await prisma.dykeSteps.findMany({
                where: {
                    value: {
                        contains: "Interior_",
                    },
                    title: "Door",
                },
            });
        }
        nextStepId = nextSteps[0]?.id;

        if (nextSteps.length > 1) {
            // console.log(nextSteps);
            nextSteps.map((s) => {
                if (
                    (product?.title && s.value?.endsWith(product.title)) ||
                    (s.title == "Hand" && s.id == 22)
                ) {
                    nextStepId = s.id;
                }
            });
        }
    }
    if (nextStepId) {
        const stepForm = await getStepForm(nextStepId);
        const stepProd = stepForm.step?.stepProducts?.[0];
        if (!isCustomStep(stepForm.step?.title, doorType)) {
            if (hiddenSteps(stepForm.step?.title, doorType)) {
                stepForm.item.meta.hidden = true;
                stepForm.item.stepId = stepForm.step?.id as any;

                return await getNextDykeStepAction(
                    stepForm.step as any,
                    null,
                    stepProd,
                    [..._steps, stepForm],
                    doorType
                );
            }

            // console.log(stepForm.step?.stepProducts.length);
            // console.log(stepForm.step?.stepProducts);
            let stepProds = stepForm.step?.stepProducts || [];
            stepProds = stepProds.filter(
                (p, i) =>
                    stepProds?.findIndex(
                        (p2) => p2.product?.title == p.product?.title
                    ) == i
            );

            if (stepProds.length == 1 && stepProd) {
                stepForm.item.value =
                    stepProd?.product.title || stepProd?.product.value;
                stepForm.item.stepId = stepProd.dykeStepId;
                return await getNextDykeStepAction(
                    stepForm.step as any,
                    stepProd?.product as any,
                    stepProd,
                    [..._steps, stepForm],
                    doorType
                );
            }
        }
        return [..._steps, stepForm];
    } else {
    }
    return null;
}
function hiddenSteps(title, doorType: DykeDoorType) {
    let hidden = [
        "width",
        "hand",
        "casing 1x4 setup",
        "--jamb stop",
        "rip jamb",
    ].includes(title?.toLowerCase());
    if (doorType == "Moulding") {
    }
    if (doorType == "Bifold" && !hidden) {
        hidden = [
            "door configuration",
            "bore",
            "jamb size",
            "casing",
            "jamb species",
            "jamb type",
            "cutdown height",
            "casing y/n",
            "hinge finish",
            "door type",
            "casing side choice",
            "casing species",
            "cutdown height",
        ].includes(title?.toLowerCase());
    }
    if (doorType == "Door Slabs Only" && !hidden) {
        hidden = [
            "door configuration",
            "bore",
            "jamb size",
            "casing",
            "jamb species",
            "jamb type",
            "cutdown height",
            "casing y/n",
            "hinge finish",
            "door type",
            "casing side choice",
            "casing species",
            "cutdown height",
        ].includes(title?.toLowerCase());
    }
    return hidden;
}
function isCustomStep(stepTitle, doorType: DykeDoorType) {
    return ["Shelf Items", "House Package Tool", "Door"].includes(stepTitle);
}
async function CustomStepForm(
    { title: productTitle },
    stepTitle,
    doorType: DykeDoorType
) {
    stepTitle = stepTitle.trim();
    console.log({ stepTitle, doorType, productTitle });

    const customSteps = {
        "Shelf Items": "Shelf Items",
        "Cutdown Height": "House Package Tool",
    };
    let title = customSteps[productTitle] || customSteps[stepTitle];
    if (doorType == "Bifold") {
        console.log(doorType);

        const customSteps = {
            "Item Type": "Height",
            Height: "Door",
            Door: "House Package Tool",
        };
        title = customSteps[productTitle] || customSteps[stepTitle];
    }
    if (doorType == "Moulding") {
        const customSteps = {
            "Item Type": "Specie",
            Specie: "Moulding",
            Moulding: "Line Item",
            // "M Casing": "Line Item",
        };
        title = customSteps[stepTitle];
        // console.log({ title, productTitle, stepTitle });
    }
    if ((doorType || productTitle) == "Services") {
        const customSteps = {
            "Item Type": "Line Item",
            //  Specie: "Moulding",
            //  Moulding: "Line Item",
            // "M Casing": "Line Item",
        };
        console.log(stepTitle);
        title = customSteps[stepTitle];
    }
    // console.log([doorType, productTitle]);

    if ((doorType || productTitle) == "Door Slabs Only") {
        // console.log(productTitle);

        const customSteps = {
            Door: "House Package Tool",
            "Item Type": "Height",
            Height: "Door Type",
            // "Door Type": "Door",
        };

        title = customSteps[stepTitle];
        console.log(title);
    }
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
