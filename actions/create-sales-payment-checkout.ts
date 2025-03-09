"use server";

import { prisma } from "@/db";
import { getSalesPaymentCheckoutInfoAction } from "./get-sales-payment-checkout-info-action";
import { SquarePaymentStatus } from "@/_v2/lib/square";
import { generateRandomString } from "@/lib/utils";
import { PaymentMethods } from "@/app/(clean-code)/(sales)/types";
import { CustomerTransactionType } from "./get-sales-customers-tx";
import { getBaseUrl } from "@/envs";
import { SQUARE_LOCATION_ID, squareClient } from "@/utils/square-utils";

interface Props {
    emailToken: string;
    orderIds: string[];
    // primaryPhoneNo: string;
    orderIdsParam: string;
}
export async function createSalesCheckoutLinkAction(props: Props) {
    const { orderIds, emailToken, orderIdsParam } = props;
    const data = await getSalesPaymentCheckoutInfoAction(orderIds, emailToken);
    const tx = await prisma.customerTransaction.create({
        data: {
            wallet: {
                connectOrCreate: {
                    where: {
                        accountNo: data.primaryPhone,
                    },
                    create: {
                        balance: 0,
                        accountNo: data.primaryPhone,
                    },
                },
            },
            amount: data.amountDue,
            paymentMethod: "link" as PaymentMethods,
            squarePayment: {
                create: {
                    status: "PENDING" as SquarePaymentStatus,
                    paymentId: generateRandomString(),
                    // amount: totalAmount,
                    orders: {
                        createMany: {
                            data: data.orders.map((order) => ({
                                orderId: order.id,
                            })),
                        },
                    },
                    amount: data.amountDue,
                    paymentMethod: "link" as PaymentMethods,
                    tip: 0,
                    checkout: {
                        create: {
                            paymentType: "link" as PaymentMethods,
                        },
                    },
                },
            },
            type: "transaction" as CustomerTransactionType,
            description: "",
            status: "PENDING" as SquarePaymentStatus,
        },
        include: {
            squarePayment: {
                include: {
                    orders: true,
                },
            },
        },
    });
    const redirectUrl = `${getBaseUrl()}/square-payment/${emailToken}/${orderIdsParam}/pament-response/${
        tx.squarePayment?.paymentId
    }`;
    const resp = await squareClient.checkoutApi.createPaymentLink({
        idempotencyKey: new Date().toISOString(),
        quickPay: {
            locationId: SQUARE_LOCATION_ID,
            name: `sales payment for order${
                orderIds.length ? "s" : ""
            } ${orderIds.join(", ")}`,
            priceMoney: {
                amount: BigInt(Math.round(data.amountDue * 100)),
                currency: "USD",
            },
        },
        prePopulatedData: {
            buyerEmail: data.email,
            buyerPhoneNumber: data.primaryPhone,
            buyerAddress: {
                addressLine1: data.address,
            },
        },
        checkoutOptions: {
            redirectUrl,
            askForShippingAddress: false,
            allowTipping: true,
        },
    });
    // const paymentId = tx.squarePayment.paymentId;
    const { result, statusCode, body: _body } = resp;
    await prisma.squarePayments.update({
        where: {
            id: tx.squarePayment.id,
        },
        data: {
            squareOrderId: result.paymentLink.orderId,
        },
    });
    const paymentLink = result.paymentLink;
    return {
        paymentLink,
    };
}
