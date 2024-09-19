"use server";
import { CheckoutStatus } from "@/app/(v2)/(loggedIn)/sales-v2/_components/_square-payment-modal/action";
import { prisma } from "@/db";
import { env } from "@/env.mjs";
import { __isProd } from "@/lib/is-prod-server";
import {
    Client,
    ApiError,
    Environment,
    OrderLineItem,
    PrePopulatedData,
} from "square";

const client = new Client({
    environment:
        env.NODE_ENV == "production"
            ? Environment.Production
            : Environment.Production,
    accessToken: env.SANBOX_ACCESS_TOKEN,
});
export interface SquarePaymentMeta {
    squareOrderId;
}
export interface BaseSalesPaymentProps {
    customerName: string;
    amount?: number;
    dueAmount: number;
    grandTotal: number;
    description?: string;
    allowTip?: boolean;
    tip?: number;
    phone?: string;
    deviceId?: string;
    email?: string;
    items?: OrderLineItem[];
    address?: PrePopulatedData["buyerAddress"];
    orderId: number;
    orderIdStr: string;
    // type: "link" | "terminal";
    salesCheckoutId?: string;
    paymentId?: string;
    squareCustomerId?: string;
    terminalStatus?:
        | "idle"
        | "processing"
        | "processed"
        | "failed"
        | "cancelled";
}
export interface CreateSalesPaymentLinkProps extends BaseSalesPaymentProps {
    type: "link";
    deviceId?: never; // deviceId should not exist for type 'link'
}

export interface CreateSalesPaymentTerminalProps extends BaseSalesPaymentProps {
    type: "terminal";
    deviceId: string; // deviceId is required for type 'terminal'
}
export type SquarePaymentStatus =
    | "APPROVED"
    | "PENDING"
    | "COMPLETED"
    | "CANCELED"
    | "FAILED";
export type CreateSalesPaymentProps =
    | CreateSalesPaymentLinkProps
    | CreateSalesPaymentTerminalProps;
export async function createSalesPayment(data: CreateSalesPaymentProps) {
    const salesCheckout = await prisma.salesCheckout.create({
        data: {
            amount: data.amount / 100,
            paymentType: `square_${data.type}`,
            status: "no-status",
            orderId: data.orderId,
            meta: {
                email: data.email,
                phone: data.phone,
            } as any,
        },
    });
    data.salesCheckoutId = salesCheckout.id;
    const checkout =
        data.type == "terminal"
            ? await ceateTerminalCheckout(data)
            : await createSalesPaymentLink(data);
    await prisma.salesCheckout.update({
        where: {
            id: salesCheckout.id,
        },
        data: {
            status: "pending",
            paymentId: checkout.id,
            meta: checkout.meta as any,
        },
    });
    return {
        ...checkout,
        paymentId: checkout.id,
        salesCheckoutId: salesCheckout.id,
    };
}
async function errorHandler(fn): Promise<{
    errors?: ApiError["errors"];
    error?;
    id?;
    meta?: SquarePaymentMeta;
    paymentUrl?: string;
}> {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                errors: JSON.parse(JSON.stringify(error.errors)),
            };
        }
        console.log(error);

        return { error: "Unable to complete" };
    }
}
export async function createSalesPaymentLink(data: CreateSalesPaymentProps) {
    return await errorHandler(async () => {
        const redirectUrl = `https://${env.NEXT_PUBLIC_ROOT_DOMAIN}/square-payment-response/${data.salesCheckoutId}`;
        const quickPay = !data.items.length || data.grandTotal != data.amount;
        console.log({ quickPay });
        const resp = await client.checkoutApi.createPaymentLink({
            idempotencyKey: new Date().toISOString(),
            quickPay: !quickPay
                ? undefined
                : {
                      locationId: env.SQUARE_LOCATION_ID,
                      name:
                          data.description || `payment for ${data.orderIdStr}`,
                      priceMoney: {
                          amount: BigInt(Math.ceil(data.amount * 100)),
                          currency: "USD",
                      },
                  },
            order: quickPay
                ? undefined
                : {
                      locationId: env.SQUARE_LOCATION_ID,
                      serviceCharges: [
                          {
                              name: "Total Amount",
                              calculationPhase: "TOTAL_PHASE",
                              amountMoney: {
                                  amount: BigInt(50000),
                                  currency: "USD",
                              },
                          },
                      ],
                      discounts: [
                          {
                              amountMoney: {
                                  amount: BigInt(403400),
                                  currency: "USD",
                              },
                              name: "Paid",
                          },
                      ],
                      //   netAmountDueMoney: {
                      //       amount: BigInt(Math.ceil(data.amount * 100)),
                      //       currency: "USD",
                      //   },
                      lineItems: data.items
                          ?.filter((i) => i.basePriceMoney.amount)
                          ?.map((item) => {
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
                redirectUrl,
                askForShippingAddress: false,
                allowTipping: data.allowTip,
            },
        });
        const { result, statusCode, body: _body } = resp;
        // result.relatedResources.orders
        const paymentLink = result.paymentLink;
        // result.relatedResources.orders[0].id
        const [order] = result.relatedResources.orders;
        return {
            paymentUrl: paymentLink.url,
            id: paymentLink.id,
            redirectUrl,
            ...result,
            meta: {
                squareOrderId: paymentLink.orderId,
            },
        };
    });
}
const refreshAccessToken = async (refreshToken) => {
    try {
        const { result } = await client.oAuthApi.obtainToken({
            clientId: process.env.SQUARE_CLIENT_ID,
            clientSecret: process.env.SQUARE_CLIENT_SECRET,
            refreshToken,
            grantType: "authorization_code",
            code: "",
        });

        console.log("New Access Token:", result.accessToken);
        return result.accessToken;
    } catch (error) {
        console.error("Error refreshing token:", error);
    }
};
export async function ceateTerminalCheckout(data: CreateSalesPaymentProps) {
    return await errorHandler(async () => {
        // client.devicesApi.listDevices
        const accessToken = await refreshAccessToken(env.SANBOX_ACCESS_TOKEN);
        console.log({ accessToken });

        const s = await client.terminalApi.createTerminalCheckout({
            // deviceId: process.env.SQUARE_TERMINAL_DEVICE_ID,
            idempotencyKey: data.salesCheckoutId, // Unique identifier for each transaction
            checkout: {
                amountMoney: {
                    amount: BigInt(Number(data.amount) * 100), // Amount in the smallest currency unit, e.g., cents
                    currency: "USD",
                },
                // deviceId: process.env.SQUARE_TERMINAL_DEVICE_ID , // Your Square Terminal device ID
                deviceOptions: {
                    deviceId: data.deviceId,
                    tipSettings: {
                        allowTipping: data.allowTip,
                    },
                },
                note: data.description || `Payment for ${data.orderIdStr}`,
                referenceId: data.orderIdStr,
                customerId: data.squareCustomerId,
                paymentOptions: {
                    // skipReceipt, // Option to skip the receipt
                },
            },
        });
        const checkoutId = s.result.checkout.id;
        // s.result.checkout.orderId
        return {
            id: checkoutId,
            meta: {
                squareOrderId: s.result.checkout.orderId,
            } as SquarePaymentMeta,
        };
    });
}
function phone(pg: string) {
    if (!pg?.includes("+")) pg = `+1 ${pg}`;
    return pg;
}
export type GetSquareDevices = Awaited<ReturnType<typeof getSquareDevices>>;
export async function getSquareDevices() {
    try {
        const devices = await client.devicesApi.listDeviceCodes();
        return devices?.result?.deviceCodes
            ?.map((device) => ({
                label: device?.name,
                status: device.status as "PAIRED" | "OFFLINE",
                value: device.deviceId,
                device,
            }))
            .sort((a, b) => a?.label?.localeCompare(b.label) as any);
    } catch (error) {
        console.log(error);
    }
}

export async function getSquareTerminalPaymentStatus(
    terminalId,
    salesCheckoutId
) {
    const payment = await client.terminalApi.getTerminalCheckout(terminalId);
    const paymentStatus = payment.result.checkout.status as
        | "PENDING"
        | "IN_PROGRESS"
        | "CANCEL_REQUESTED"
        | "CANCELED"
        | "COMPLETED";
    const tipAmount = payment?.result?.checkout?.tipMoney?.amount;
    if (tipAmount) {
        const checkout = await prisma.salesCheckout.findUnique({
            where: {
                id: salesCheckoutId,
            },
        });
        await prisma.salesCheckout.update({
            where: {
                id: salesCheckoutId,
            },
            data: {
                tip: Number(tipAmount) / 100,
            },
        });
    }

    return paymentStatus;
}
export async function validateSquarePayment(id) {
    // const resp = await prisma.$transaction((async (tx) => {
    const tx = prisma;
    const checkout = await tx.salesCheckout.findUnique({
        where: {
            id,
        },
        include: {
            order: true,
            tenders: true,
        },
    });
    const meta: SquarePaymentMeta = checkout.meta as any;
    const {
        result: {
            order: { id: orderId, tenders },
        },
    } = await client.ordersApi.retrieveOrder(meta.squareOrderId);

    const resp: { amount; tip; status: SquarePaymentStatus } = {
        amount: null,
        tip: null,
        status: null,
    };

    await Promise.all(
        tenders.map(async (tender) => {
            const {
                result: { payment },
            } = await client.paymentsApi.getPayment(tender.paymentId);
            const tip = payment.tipMoney?.amount;
            resp.status = payment.status as any;
            if (resp.status == "COMPLETED") {
                resp.amount = Number(payment.amountMoney.amount) / 100;
                let t = Number(tip);
                resp.tip = t > 0 ? t / 100 : 0;
            }
            await tx.checkoutTenders.create({
                data: {
                    salesCheckoutId: checkout.id,
                    squareOrderId: orderId,
                    status: resp.status,
                    tenderId: tender.id,
                    squarePaymentId: payment.id,
                },
            });
        })
    );
    if (resp.amount > 0) await paymentSuccess({ ...checkout, tip: resp.tip });
    return resp;
}
export async function paymentSuccess(p: {
    amount;
    orderId;
    tip;
    order: { customerId; amountDue };
    id;
}) {
    const _p = await prisma.salesPayments.create({
        data: {
            // transactionId: 1,
            amount: p.amount,
            orderId: p.orderId,
            tip: p.tip,
            meta: {},
            status: "success",
            customerId: p.order.customerId,
        },
    });
    await prisma.salesCheckout.update({
        where: {
            id: p.id,
        },
        data: {
            tip: p.tip,
            status: "success" as CheckoutStatus,
            salesPaymentsId: _p.id,
        },
    });
    let amountDue = p.order.amountDue - p.amount;
    await prisma.salesOrders.update({
        where: {
            id: p.orderId,
        },
        data: {
            amountDue,
        },
    });
}
export async function squarePaymentSuccessful(id) {
    const p = await prisma.salesCheckout.findUnique({
        where: {
            id,
        },
        include: {
            order: true,
        },
    });
    if (p.status == "success") return;
    await paymentSuccess(p);
}
export async function cancelTerminalPayment(id) {
    const p = await prisma.salesCheckout.findUnique({
        where: {
            id,
        },
        include: {
            order: true,
        },
    });
    await prisma.salesCheckout.update({
        where: { id },
        data: {
            status: "cancelled",
        },
    });
}
