"use server";

import { SquarePaymentStatus } from "@/_v2/lib/square";
import { prisma } from "@/db";
import { amountFromCent, squareClient } from "@/utils/square-utils";

interface Props {
    squareOrderId: string;
    checkoutId: string;
}
export async function updateSalesCheckoutStatus({
    squareOrderId,
    checkoutId,
}: Props) {
    const checkout = await squareClient.ordersApi.retrieveOrder(squareOrderId);
    const createdAt = new Date();

    const tenders = await Promise.all(
        checkout.result.order.tenders.map(async (tender) => {
            const {
                result: { payment },
            } = await squareClient.paymentsApi.getPayment(tender.paymentId);
            const tipCent = payment.tipMoney?.amount;
            const status = payment.status as SquarePaymentStatus;
            const tenderId = payment.id;
            const amountCent = payment.amountMoney.amount;

            return await prisma.checkoutTenders.upsert({
                where: {
                    tenderId,
                },
                create: {
                    tenderId,
                    status,
                    tip: amountFromCent(tipCent),
                    amount: amountFromCent(amountCent),
                    salesCheckoutId: checkoutId,
                    createdAt,
                },
                update: {
                    status,
                    tip: amountFromCent(tipCent),
                    amount: amountFromCent(amountCent),
                },
            });
        })
    );
    return {
        newTenders: tenders.filter(
            (tender) =>
                tender.status === ("COMPLETED" as SquarePaymentStatus) &&
                tender.createdAt === createdAt
        ).length,
    };
}
