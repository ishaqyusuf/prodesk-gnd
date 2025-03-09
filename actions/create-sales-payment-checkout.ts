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
    email: string;
    slugs: string[];
    primaryPhoneNo: string;
    amount: number;
    rawSlug: string;
    address?: string;
}
export async function getSalesCheckoutLinkAction(props: Props) {
    const { slugs, email, primaryPhoneNo, amount, rawSlug } = props;
    const data = await getSalesPaymentCheckoutInfoAction(slugs, email);
    // create square payment with (orders) squarepaymentorders
    const tx = await prisma.customerTransaction.create({
        data: {
            wallet: {
                connectOrCreate: {
                    where: {
                        accountNo: primaryPhoneNo,
                    },
                    create: {
                        balance: 0,
                        accountNo: primaryPhoneNo,
                    },
                },
            },
            amount,
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
                    amount,
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
    const redirectUrl = `${getBaseUrl()}/square-payment/${email}/${rawSlug}`;
    const resp = await squareClient.checkoutApi.createPaymentLink({
        idempotencyKey: new Date().toISOString(),
        quickPay: {
            locationId: SQUARE_LOCATION_ID,
            name: `sales payment for order${
                slugs.length ? "s" : ""
            } ${slugs.join(", ")}`,
            priceMoney: {
                amount: BigInt(Math.round(data.amountDue * 100)),
                currency: "USD",
            },
        },
        prePopulatedData: {
            buyerEmail: props.email,
            buyerPhoneNumber: props.primaryPhoneNo,
            buyerAddress: {
                addressLine1: props.address,
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
