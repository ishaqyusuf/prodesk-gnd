"use server";

import { SquarePaymentStatus } from "@/_v2/lib/square";
import { prisma } from "@/db";

interface Props {
    paymentId: string;
}

export async function salesPaymentCheckoutResponse(props: Props) {
    const payment = await prisma.customerTransaction.findFirst({
        where: {
            squarePayment: {
                paymentId: props.paymentId,
            },
        },
        include: {
            squarePayment: {
                include: {
                    orders: {
                        include: {
                            order: {
                                select: {
                                    amountDue: true,
                                    id: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    const paymentStatus = payment.status as SquarePaymentStatus;
    if (paymentStatus == "PENDING") {
        //
    }
}
