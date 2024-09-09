"use server";
import { prisma } from "@/db";
import { env } from "@/env.mjs";
import { __isProd } from "@/lib/is-prod-server";
import { Client, Environment, OrderLineItem, PrePopulatedData } from "square";

const client = new Client({
    environment:
        env.NODE_ENV == "production"
            ? Environment.Production
            : Environment.Sandbox,
    accessToken: env.SANDBOX_APP_ID,
});
export interface CreateSalesPaymentProps {
    amount?: number;
    allowTip?: boolean;
    tip?: number;
    phone?: string;
    email?: string;
    items: OrderLineItem[];
    address?: PrePopulatedData["buyerAddress"];
    orderId: number;
}
export async function createSalesPayment(data: CreateSalesPaymentProps) {
    console.log("```````", data, "`````````````");
    const resp = await client.checkoutApi.createPaymentLink({
        idempotencyKey: new Date().toISOString(),
        quickPay: {
            locationId: env.SQUARE_LOCATION_ID,
            name: "Item",
            priceMoney: {
                amount: BigInt(Math.ceil(data.amount * 100)),
                currency: "USD",
            },
        },
        // order: {
        //     locationId: env.SQUARE_LOCATION_ID,
        //     lineItems:
        //         !__isProd || !data.items.length
        //             ? [
        //                   {
        //                       quantity: "1",
        //                       basePriceMoney: {
        //                           amount: BigInt(5000),
        //                           currency: "USD",
        //                       },
        //                       name: "ITEM NAME",
        //                   },
        //               ]
        //             : data.items,
        // },
        // prePopulatedData: {
        //     buyerEmail: data.email,
        //     buyerPhoneNumber: data.phone,
        //     buyerAddress: data.address,
        // },
        checkoutOptions: {
            redirectUrl: `https://${env.NEXT_PUBLIC_ROOT_DOMAIN}/api/payment-success`,
            askForShippingAddress: false,
            allowTipping: data.allowTip,
        },
    });
    const { result, statusCode, body: _body } = resp;
    console.log("```````````", JSON.stringify(resp), "`````````````````");
    if (typeof _body === "string") {
        const bdy = JSON.parse(_body);
        console.log(bdy);
        if (bdy?.errors) throw new Error(_body);
    }

    if (statusCode == 400) throw new Error("Eror 400");
    if (result.errors.length) {
        throw new Error("Unable to create payment link");
    }
    const paymentLink = result.paymentLink;
    await prisma.salesCheckout.create({
        data: {
            id: paymentLink.id,
            amount: data.amount,
            paymentType: "sales_payment",
            status: "pending",
            orderId: data.orderId,
            meta: {
                email: data.email,
                phone: data.phone,
            } as any,
        },
    });
    return paymentLink.url;
    // await dealerEmail({
    //     to: data.email,
    //     body: ``,
    // });
    // result.paymentLink.id
    // client.checkoutApi.deletePaymentLink(id);
    // const paymentUrl = result.paymentLink.;
}
