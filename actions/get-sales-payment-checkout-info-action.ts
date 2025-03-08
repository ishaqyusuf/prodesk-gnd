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
                },
            },
            customer: {
                select: {
                    name: true,
                    businessName: true,
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
    return {
        orders: ls,
        amountDue: sum(
            ls.filter((a) => a.amountDue > 0),
            "amountDue"
        ),
    };
    // return order;
}
