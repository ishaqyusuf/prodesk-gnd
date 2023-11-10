"use server";

import { SalesQueryParams } from "@/types/sales";
import { getSales } from "./sales";
import { prisma } from "@/db";
import { _revalidate } from "../_revalidate";

export async function getSalesDelivery(query: SalesQueryParams) {
    query.deliveryOption = "delivery";
    return await getSales(query);
}
export async function updateSalesDelivery(id, status) {
    const updateData: any = {
        status
    };
    if (status == "Delivered") updateData.deliveredAt = new Date();

    await prisma.salesOrders.update({
        where: { id },
        data: {
            status,
            deliveredAt: status == "Delivered" ? new Date() : null,
            updatedAt: new Date()
        }
    });
    _revalidate("delivery");
}
