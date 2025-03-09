"use server";

import { squareClient, SquarePaymentStatus } from "@/_v2/lib/square";

interface Props {
    squareOrderId: string;
    checkoutId: string;
}
export async function getSalesCheckoutStatus({
    squareOrderId,
    checkoutId,
}: Props) {
    const checkout = await squareClient.ordersApi.retrieveOrder(squareOrderId);
    const resp: { amount; tip; status: SquarePaymentStatus } = {
        amount: null,
        tip: null,
        status: null,
    };
    const tenders = await Promise.all(
        checkout.result.order.tenders.map(async (tender) => {
            const {
                result: { payment },
            } = await squareClient.paymentsApi.getPayment(tender.paymentId);
            const tip = payment.tipMoney?.amount;
            const status = payment.status as SquarePaymentStatus;
        })
    );
}
