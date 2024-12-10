import { AsyncFnType } from "@/app/(clean-code)/type";
import { DykeStepMeta } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice, DykeStepForm, Prisma } from "@prisma/client";
import { DykeFormStepMeta, StepComponentMeta, StepMeta } from "../../types";
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
    // console.log({ wheres, count: stepComponents.length });

    return stepComponents.map((component) => {
        const { door, product } = component;
        return {
            // nextStepId: component.nextStepId,
            uid: component.uid,
            id: component.id,
            title: door?.title || product?.title,
            img: product?.img || door?.img,
            productId: product?.id || door?.id,
            variations: component?.meta?.variations || [],
            salesPrice: null,
            basePrice: null,
            stepId,
            productCode: component.productCode,
            redirectUid: component.redirectUid,
            _metaData: {
                custom: component.custom,
                visible: false,
            },
        };
    });
}

interface ValidateNextStepIdProps {
    nextStepId;
}
export async function validateNextStepIdDta({}: ValidateNextStepIdProps) {}
export type GetStepsForRoutingProps = AsyncFnType<typeof getStepsForRoutingDta>;
export async function getStepsForRoutingDta() {
    // await fixStepsDta();
    // return [];
    const steps = await prisma.dykeSteps.findMany({
        select: {
            id: true,
            uid: true,
            title: true,
            stepValueId: true,
            prevStepValueId: true,
            rootStepValueId: true,
            meta: true,
            stepProducts: {
                where: notDeleted.where,
                select: {
                    // nextStepId: true,
                    redirectUid: true,
                    nextStepId: true,
                    dykeStepId: true,
                    uid: true,
                    custom: true,
                    meta: true,
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
    return steps
        .filter((d, i) => {
            const f1 = steps.findIndex((a) => a.title == d.title) == i;
            if (d.title == "Door Type") return d.id == 41;
            return f1;
        })
        .filter((a) => a.title)
        .filter((a) => !a.title.includes("--"))
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((data) => {
            return {
                ...data,
                meta: data.meta as any as StepMeta,
                stepProducts: data.stepProducts?.map((prod) => {
                    return {
                        ...prod,
                        meta: (prod.meta || {}) as StepComponentMeta,
                    };
                }),
            };
        });
}
export async function fixStepsDta() {
    const stepprod = await prisma.dykeSteps.findMany({
        where: {
            stepProducts: {
                some: {
                    product: {
                        title: "Wood Stile & Rail",
                    },
                },
            },
        },
        include: {
            stepProducts: {
                where: {
                    product: {
                        title: "Wood Stile & Rail",
                    },
                },
                include: {
                    product: true,
                },
            },
        },
    });
    const species = await prisma.dykeSteps.findFirst({
        where: {
            title: "Door Species",
        },
    });
    // console.log(species);
    await prisma.dykeStepProducts.updateMany({
        where: {
            id: {
                in: stepprod
                    .map((s) => s.stepProducts.map((s) => s.id).flat())
                    .flat(),
            },
        },
        data: {
            nextStepId: species.id,
        },
    });
    // console.log(
    //     ">",
    //     stepprod.length,
    //     stepprod.map((s) =>
    //         s.stepProducts.map((p) => `${p.id}. ${p.product.title}`)
    //     )
    // );
}
export async function deleteStepProductsByUidDta(uids: string[]) {
    await prisma.dykeStepProducts.updateMany({
        where: {
            uid: {
                in: uids,
            },
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
export async function getStepComponentsMetaByUidDta(uids: string[]) {
    return (
        await prisma.dykeStepProducts.findMany({
            where: {
                uid: { in: uids },
            },
            select: {
                id: true,
                meta: true,
            },
        })
    ).map(({ id, meta }) => ({ id, meta: meta as StepComponentMeta }));
}
export async function updateStepComponentMetaDta(id, meta) {
    const data = await prisma.dykeStepProducts.update({
        where: { id },
        data: { meta },
    });
}
export async function updateStepMetaDta(id, meta) {
    const data = await prisma.dykeSteps.update({
        where: { id },
        data: { meta },
    });
    return data;
}
