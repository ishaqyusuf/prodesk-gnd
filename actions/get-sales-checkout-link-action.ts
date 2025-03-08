"use server";

import { prisma } from "@/db";
import { getSalesPaymentCheckoutInfoAction } from "./get-sales-payment-checkout-info-action";
import { SquarePaymentStatus } from "@/_v2/lib/square";
import { generateRandomString } from "@/lib/utils";

export async function getSalesCheckoutLinkAction(emailTok, slugs) {
    const data = await getSalesPaymentCheckoutInfoAction(slugs, emailTok);
    // create square payment with (orders) squarepaymentorders
    // const p = await prisma.squarePayments.create({
    //     data: {
    //         status: "PENDING" as SquarePaymentStatus,
    //         paymentId: generateRandomString(),
    //         // amount: totalAmount,
    //         orders: {
    //             createMany: {
    //                 data: data.orders.map((order) => ({
    //                     orderId: order.id,
    //                 })),
    //             },
    //         },
    //     },
    // });
    // const payment = await prisma.salesPayments.findMany({
    //     where: {
    //          checkout: {
    //             order: {
    //             }
    //          }
    //     }
    // })
}
