"use server";

import { SquarePaymentStatus } from "@/_v2/lib/square";
import { SalesPaymentStatus } from "@/app/(clean-code)/(sales)/types";
import { prisma } from "@/db";
import { formatMoney } from "@/lib/use-number";
import { sum } from "@/lib/utils";

interface Props {
    salesPaymentId: string;
}
export async function finalizeSalesCheckout({ salesPaymentId }: Props) {
    const cTx = await prisma.customerTransaction.findFirst({
        where: {
            squarePayment: {
                paymentId: salesPaymentId,
            },
        },
        include: {
            salesPayments: {
                include: {
                    order: true,
                },
            },
            squarePayment: {
                include: {
                    orders: {
                        include: {
                            order: {
                                select: {
                                    id: true,
                                    amountDue: true,
                                },
                            },
                        },
                    },
                    checkout: {
                        include: {
                            tenders: true,
                        },
                    },
                },
            },
        },
    });
    const status: SquarePaymentStatus = cTx.status as any;
    if (status != "COMPLETED") throw new Error("Payment Already Applied!");

    const tenders = cTx.squarePayment.checkout.tenders;
    const validTenders = tenders.filter(
        (s) => s.status == ("COMPLETED" as SquarePaymentStatus)
    );
    if (!validTenders.length) {
        // const _status = Array.from(new Set(cTx.squarePayment.checkout.tenders.map(s =>s.status)));
        await prisma.customerTransaction.update({
            where: {
                id: cTx.id,
            },
            data: {
                status: "FAILED" as SquarePaymentStatus,
            },
        });
        throw new Error("Unable to validate payment");
    }
    const [totalAmount, totalTip] = [
        sum(validTenders, "amount"),
        sum(validTenders, "tip"),
    ];
    const squarePayment = cTx.squarePayment;
    const tip =
        totalTip > 0 ? formatMoney(totalTip / squarePayment.orders.length) : 0;
    let balance = totalAmount;
    await Promise.all(
        squarePayment.orders.map(async (o) => {
            let orderAmountDue = formatMoney(o.order.amountDue);
            let paidAmount =
                balance >= orderAmountDue
                    ? orderAmountDue
                    : formatMoney(orderAmountDue - balance);
            balance = formatMoney(balance - paidAmount);
            if (paidAmount) {
                await prisma.salesPayments.create({
                    data: {
                        amount: paidAmount,
                        tip,
                        orderId: o.orderId,
                        // squarePayments: {
                        //     connect: {
                        //         id: squarePayment.id,
                        //     },
                        // },
                        note: `payment via square checkout`,
                        status: `success` as SalesPaymentStatus,
                        transactionId: cTx.id,
                        squarePaymentsId: squarePayment.id,
                        // transaction: {
                        //     connect: {
                        //         id: cTx.id,
                        //     },
                        // },
                    },
                });
                await prisma.salesOrders.update({
                    where: {
                        id: o.orderId,
                    },
                    data: {
                        amountDue: formatMoney(orderAmountDue - paidAmount),
                    },
                });
            }
        })
    );
}
