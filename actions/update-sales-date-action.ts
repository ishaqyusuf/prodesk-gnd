"use server";

import { prisma } from "@/db";

export async function updateSalesDateAction(id, newDate, oldDate) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id,
        },
        select: {
            createdAt: true,
            paymentDueDate: true,
            type: true,
            paymentTerm: true,
        },
    });
}
