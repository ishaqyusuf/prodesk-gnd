"use server";
import { prisma } from "@/db";
import { env } from "@/env.mjs";
import { __isProd } from "@/lib/is-prod-server";
import { Client, Environment, OrderLineItem, PrePopulatedData } from "square";

const client = new Client({
    environment:
        env.NODE_ENV == "production"
            ? Environment.Sandbox
            : Environment.Sandbox,
    accessToken: env.SANBOX_ACCESS_TOKEN,
});
export interface CreateSalesPaymentProps {
    amount?: number;
    description?: string;
    allowTip?: boolean;
    tip?: number;
    phone?: string;
    email?: string;
    items: OrderLineItem[];
    address?: PrePopulatedData["buyerAddress"];
    orderId: number;
}
export async function createSalesPayment(data: CreateSalesPaymentProps) {
    const salesCheckout = await prisma.salesCheckout.create({
        data: {
            amount: data.amount,
            paymentType: "sales_payment",
            status: "no-status",
            orderId: data.orderId,
            meta: {
                email: data.email,
                phone: data.phone,
            } as any,
        },
    });
    const resp = await client.checkoutApi.createPaymentLink({
        idempotencyKey: new Date().toISOString(),
        quickPay: data.items.length
            ? undefined
            : {
                  locationId: env.SQUARE_LOCATION_ID,
                  name: data.description,
                  priceMoney: {
                      amount: BigInt(Math.ceil(data.amount * 100)),
                      currency: "USD",
                  },
              },
        order: !data.items.length
            ? undefined
            : {
                  locationId: env.SQUARE_LOCATION_ID,
                  serviceCharges: [
                      // {}
                  ],
                  netAmountDueMoney: {
                      amount: BigInt(Math.ceil(data.amount * 100)),
                      currency: "USD",
                  },
                  lineItems: data.items?.map((item) => {
                      item.basePriceMoney.amount = BigInt(
                          item.basePriceMoney.amount
                      );
                      return item;
                  }),
              },
        prePopulatedData: {
            buyerEmail: data.email,
            buyerPhoneNumber: phone(data.phone),
            buyerAddress: data.address,
        },
        checkoutOptions: {
            redirectUrl: `https://${env.NEXT_PUBLIC_ROOT_DOMAIN}/sales-payment/${salesCheckout.id}`,
            askForShippingAddress: false,
            allowTipping: data.allowTip,
        },
    });
    const { result, statusCode, body: _body } = resp;
    // console.log("```````````", JSON.stringify(resp), "`````````````````");
    if (typeof _body === "string") {
        const bdy = JSON.parse(_body);
        if (bdy?.errors) throw new Error(_body);
    }

    if (statusCode == 400) throw new Error("Eror 400");
    if (result?.errors?.length) {
        throw new Error("Unable to create payment link");
    }

    const paymentLink = result.paymentLink;
    await prisma.salesCheckout.update({
        where: {
            id: salesCheckout.id,
        },
        data: {
            status: "pending",
            paymentId: paymentLink.id,
        },
    });
    return paymentLink.url;
}
function phone(pg: string) {
    if (!pg?.includes("+")) pg = `+1 ${pg}`;
    return pg;
}
