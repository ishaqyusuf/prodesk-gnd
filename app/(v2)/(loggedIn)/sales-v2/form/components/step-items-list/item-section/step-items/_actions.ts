"use server";

import { prisma } from "@/db";
import { IStepProducts } from ".";

export async function _deleteStepItem(item: IStepProducts[0]) {
    const resp = await prisma.dykeStepProducts.update({
        where: {
            id: item.id,
        },
        data: {
            deletedAt: new Date(),
            product: {
                update: {
                    deletedAt: new Date(),
                },
            },
        },
        include: {
            product: true,
        },
    });
    // console.log(resp?.deletedAt);
}
export async function _deleteDoorStep(item: IStepProducts[0]) {}
