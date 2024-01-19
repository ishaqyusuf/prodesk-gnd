"use server";

import { prisma } from "@/db";
import { DykeStepForm } from "@prisma/client";

export async function getStepForm(id) {
    const tag = `dyke-step-${id}`;
    // console.log(tag);
    // return unstable_cache(
    //     async () => {
    const step = await prisma.dykeSteps.findUnique({
        where: {
            id,
        },

        // include: {
        //     stepProducts: {
        //         include: {
        //             product: true,
        //         },
        //     },
        // },
    });
    // console.log(step);
    return {
        // step,
        step,
        item: {
            stepId: id,
            meta: {},
        } as DykeStepForm,
    };
    //     },
    //     [tag],
    //     {
    //         revalidate: 60 * 60 * 6,
    //         tags: [tag],
    //     }
    // );
}
// export async function getStepProductsAction
