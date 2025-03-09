"use server";

import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { AsyncFnType } from "@/types";

export type GetSalesPaymentCheckoutInfo = AsyncFnType<
    typeof getSalesPaymentCheckoutInfoAction
>;
export async function getSalesPaymentCheckoutInfoAction(slugs, email) {
    const orders = await prisma.salesOrders.findMany({
        where: {
            slug: {
                in: slugs,
            },
            OR: [
                {
                    customer: {
                        email: {
                            startsWith: email,
                        },
                    },
                },
                {
                    billingAddress: {
                        email: {
                            startsWith: email,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
            orderId: true,
            amountDue: true,
            billingAddress: {
                select: {
                    name: true,
                    phoneNo: true,
                },
            },
            customer: {
                select: {
                    name: true,
                    businessName: true,
                    phoneNo: true,
                    wallet: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
    });
    if (orders.length != slugs?.length) throw new Error("Unauthorized");
    const ls = orders.map((order) => ({
        customerName:
            order.customer?.name ||
            order.customer?.businessName ||
            order.billingAddress?.name,
        amountDue: order.amountDue,
        id: order.id,
        orderNo: order.orderId,
    }));
    const phoneNoList = Array.from(
        new Set(
            orders
                .map((order) =>
                    [
                        order.customer?.phoneNo,
                        order.billingAddress?.phoneNo,
                    ]?.filter(Boolean)
                )
                .flat()
        )
    );
    const primaryPhone = phoneNoList.length == 1 ? phoneNoList?.[0] : null;
    // const walletId = orders.map(a => a.customer?.wallet?.id)
    return {
        orders: ls,
        phoneNoList,
        primaryPhone,
        amountDue: sum(
            ls.filter((a) => a.amountDue > 0),
            "amountDue"
        ),
    };
    // return order;
}
