"use server";

import { prisma } from "@/db";
import { AsyncFnType } from "@/types";
import { ISalesPaymentMeta } from "@/types/sales";

export type GetSalesPayments = AsyncFnType<typeof getSalesPaymentsAction>;
export async function getSalesPaymentsAction(id) {
    const payments = await prisma.salesPayments.findMany({
        where: {
            order: {
                id,
            },
        },
        select: {
            id: true,
            order: {
                select: {
                    orderId: true,
                },
            },
            meta: true,
            status: true,
            amount: true,
            createdAt: true,

            transaction: {
                select: {
                    id: true,
                    paymentMethod: true,
                    status: true,
                    author: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            },
        },
    });
    return payments.map((payment) => {
        let meta: ISalesPaymentMeta = payment.meta as any;
        return {
            paymentId: `P${payment.id}-T${payment.transaction.id}`,
            receivedBy: payment.transaction.author.name,
            amount: payment.amount,
            date: payment.createdAt,
            status: payment.status,
            paymentMethod:
                payment.transaction.paymentMethod ||
                meta?.paymentOption ||
                meta?.payment_option,
        };
    });
}
