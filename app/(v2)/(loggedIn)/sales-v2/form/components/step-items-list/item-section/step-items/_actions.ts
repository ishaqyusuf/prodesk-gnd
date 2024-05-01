"use server";

import { prisma } from "@/db";
import { IStepProducts } from ".";

export async function _deleteStepItem(item: IStepProducts[0]) {
    await prisma.dykeStepProducts.update({
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
    });
}
