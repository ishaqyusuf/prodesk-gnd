"use server";

import { prisma } from "@/db";
import { sum } from "@/lib/utils";

export type GetSalesPaymentData = NonNullable<
    Awaited<ReturnType<typeof getSalesPaymentData>>
>;
export async function getSalesPaymentData(id) {
    const order = await prisma.salesOrders.findUnique({
        where: { id },
        include: {
            checkouts: {
                where: {
                    deletedAt: null,
                },
            },
            customer: true,
            shippingAddress: true,
            billingAddress: true,
        },
    });
    if (!order) throw Error("Order not found");
    const pendingCheckouts = order.checkouts?.filter(
        (c) => c.status != "pending"
    );
    const pendingAmount = sum(pendingCheckouts, "amount");
    return {
        ...order,
        canCreatePaymentLink: order.amountDue > pendingAmount,
        pendingAmount,
    };
}
