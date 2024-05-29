"use server";

import { prisma } from "@/db";
import { ISalesPaymentMeta } from "@/types/sales";

export async function getSalesPayments(orderId) {
    const order = await prisma.salesOrders.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            orderId: true,
            paymentDueDate: true,
            paymentTerm: true,
            grandTotal: true,
            amountDue: true,
            payments: true,
            salesRepId: true,
            customerId: true,
        },
    });

    return {
        ...order,
        payments: order?.payments.map((payment) => {
            return {
                ...payment,
                meta: payment.meta as any as ISalesPaymentMeta,
            };
        }),
    };
}
