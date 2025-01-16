"use server";

import { prisma } from "@/db";
import { AsyncFnType } from "@/types";
import { SalesMeta } from "../../types";
import { IconKeys } from "@/components/_v1/icons";
import { formatMoney } from "@/lib/use-number";

export type LoadSalesOverviewAction = AsyncFnType<
    typeof loadSalesOverviewAction
>;
export async function loadSalesOverviewAction(id) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: { id },
        select: {
            type: true,
            orderId: true,
            id: true,
            amountDue: true,
            grandTotal: true,
            isDyke: true,
            customer: {
                select: {
                    id: true,
                    phoneNo: true,
                    name: true,
                    businessName: true,
                },
            },
            shippingAddress: {
                select: {
                    id: true,
                    phoneNo: true,
                    name: true,
                    address1: true,
                },
            },
            billingAddress: {
                select: {
                    id: true,
                    phoneNo: true,
                    name: true,
                    address1: true,
                },
            },
            meta: true,
            salesRep: {
                select: {
                    name: true,
                    id: true,
                },
            },
        },
    });
    const displayName =
        order.customer?.businessName ||
        order.customer?.name ||
        order.billingAddress?.name;
    const meta: SalesMeta = order.meta || ({} as any);
    function addressLine(value, icon: IconKeys) {
        return { value, icon };
    }
    const phoneNo = order.customer?.phoneNo || order.billingAddress?.phoneNo;
    return {
        type: order.type,
        id: order.id,
        dyke: order.isDyke,
        po: meta?.po,
        orderId: order.orderId,
        salesRep: order.salesRep,
        invoice: {
            total: order.grandTotal,
            pending: order.amountDue,
            paid: formatMoney(order.grandTotal - order.amountDue),
        },
        title: [order.orderId, displayName].filter(Boolean).join(" | "),
        subtitle: "",
        phoneNo,
        displayName,
        shipping: [
            addressLine(order.shippingAddress?.name, "user"),
            addressLine(order.shippingAddress?.phoneNo, "phone"),
            addressLine(order.shippingAddress?.address1, "address"),
        ].filter((a) => a.value),
        billing: [
            addressLine(order.billingAddress?.name, "user"),
            addressLine(order.billingAddress?.phoneNo, "phone"),
            addressLine(order.billingAddress?.address1, "address"),
        ].filter((a) => a.value),
    };
}
