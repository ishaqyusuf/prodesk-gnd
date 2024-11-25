import { AsyncFnType } from "@/app/(clean-code)/type";
import { DykeStepMeta } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice, DykeStepForm, Prisma } from "@prisma/client";
import { DykeFormStepMeta, StepComponentMeta } from "../../types";
import { notDeleted } from "../utils/db-utils";

export type GetStepDta = AsyncFnType<typeof getStepDta>;
export async function getSalesFormStepByIdDta(id) {
    const step = await prisma.dykeSteps.findUnique({
        where: {
            id,
        },
        include: {
            stepProducts: {
                where: notDeleted.where,
                include: {
                    product: true,
                },
            },
        },
    });

    return {
        step: {
            ...step,
            meta: (step.meta || {
                priceDepencies: {},
                stateDeps: {},
            }) as DykeStepMeta,
        },
        item: {
            stepId: id,
            meta: {},
        } as Omit<DykeStepForm, "meta"> & {
            meta: DykeFormStepMeta;
            priceData?: Partial<ComponentPrice>;
        },
    };
}
export async function getStepDta(dyekStepId) {
    const step = await prisma.dykeSteps.findUnique({
        where: {
            id: dyekStepId,
        },
        include: {
            stepProducts: {
                include: {
                    product: true,
                },
            },
        },
    });
    return {
        title: step?.title,
        value: null,
        stepId: step?.id,
        stepFormId: null,
        stepUid: step.uid,
    };
}
export type GetStepComponents = AsyncFnType<typeof getStepComponentsDta>;
export async function getStepComponentsDta(stepTitle, stepId) {
    const wheres: Prisma.DykeStepProductsWhereInput[] = [];
    if (stepTitle == "Door")
        wheres.push({
            door: { isNot: null },
        });
    else if (stepTitle == "Moulding")
        wheres.push({
            product: {
                category: {
                    title: stepTitle,
                },
            },
        });
    else {
        if (stepId) {
            wheres.push({
                dykeStepId: stepId,
            });
        }
    }
    const stepComponents = (
        await prisma.dykeStepProducts.findMany({
            where: wheres?.length > 1 ? { AND: wheres } : wheres[0],
            include: {
                door: true,
                product: true,
                // step: {
                //     select: {
                //         id: true
                //     }
                // }
            },
        })
    ).map((a) => {
        return {
            ...a,
            meta: a.meta as any as StepComponentMeta,
        };
    });
    return stepComponents.map((component) => {
        const { door, product } = component;
        return {
            nextStepId: component.nextStepId,
            uid: component.uid,
            id: component.id,
            title: door?.title || product?.title,
            img: product?.img || door?.img,
            variation: component?.meta?.variation || {},
            price: 4.5,
            stepId,
        };
    });
}

interface ValidateNextStepIdProps {
    nextStepId;
}
export async function validateNextStepIdDta({}: ValidateNextStepIdProps) {}
export type GetStepsForRoutingProps = AsyncFnType<typeof getStepsForRoutingDta>;
export async function getStepsForRoutingDta() {
    const steps = await prisma.dykeSteps.findMany({
        select: {
            id: true,
            uid: true,
            title: true,
            stepValueId: true,
            prevStepValueId: true,
            rootStepValueId: true,
            stepProducts: {
                where: notDeleted.where,
                select: {
                    // nextStepId: true,
                    dykeStepId: true,
                    uid: true,
                    custom: true,
                    product: {
                        select: {
                            title: true,
                            value: true,
                        },
                    },
                    door: {
                        select: {
                            title: true,
                        },
                    },
                },
            },
        },
    });
    return steps;
}
