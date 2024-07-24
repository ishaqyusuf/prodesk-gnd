"use server";

import { prisma } from "@/db";
import { DykeStepMeta } from "../../../../type";

export async function savePriceDepencies(id, meta: DykeStepMeta) {
    const resp = await prisma.dykeSteps.update({
        where: { id },
        data: {
            meta: meta as any,
            updatedAt: new Date(),
        },
    });
    return resp;
}
