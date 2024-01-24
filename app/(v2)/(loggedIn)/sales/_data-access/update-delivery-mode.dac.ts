"use client";

import { _revalidate, revalidatePaths } from "@/app/(v1)/_actions/_revalidate";
import { prisma } from "@/db";

export async function updateDeliveryModeDac(
    id,
    mode,
    revalidate?: revalidatePaths
) {
    await prisma.salesOrders.update({
        where: {
            id,
        },
        data: {
            deliveryOption: mode,
            deliveredAt: null,
        },
    });
    if (revalidate) _revalidate(revalidate);
}
