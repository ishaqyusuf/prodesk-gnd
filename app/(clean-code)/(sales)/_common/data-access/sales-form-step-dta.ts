import { AsyncFnType } from "@/app/(clean-code)/type";
import { DykeStepMeta } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice, DykeStepForm } from "@prisma/client";
import { DykeFormStepMeta } from "../../types";

export type GetStepDta = AsyncFnType<typeof getStepDta>;
export async function getSalesFormStep(id) {
    const step = await prisma.dykeSteps.findUnique({
        where: {
            id,
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
