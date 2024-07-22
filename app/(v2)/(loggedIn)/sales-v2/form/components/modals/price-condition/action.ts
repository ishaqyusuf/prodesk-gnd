"use server";

import { prisma } from "@/db";

export async function savePriceConditionAction(id, meta) {
    const resp = await prisma.dykeSteps.update({
        where: { id },
        data: {
            meta,
            updatedAt: new Date(),
        },
    });
    return resp;
}
