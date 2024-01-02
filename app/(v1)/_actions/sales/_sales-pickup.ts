"use server";

import { SalesQueryParams } from "@/types/sales";
import { whereSales } from "./sales";
import { prisma } from "@/db";
import { _revalidate } from "../_revalidate";
import { getPageInfo, queryFilter } from "../action-utils";
import { userId } from "../utils";
import { saveProgress } from "../progress";

export async function _getSalesPickup(query: SalesQueryParams) {
    query.deliveryOption = "pickup";
    query.type = "order";
    const where = await whereSales(query);

    const _items = await prisma.salesOrders.findMany({
        where,
        ...(await queryFilter(query)),
        include: {
            customer: true,
            pickup: true
        }
    });
    const pageInfo = await getPageInfo(query, where, prisma.salesOrders);
    return {
        pageInfo,
        data: _items as any
    };
}
export async function _cancelSalesPickup(salesId) {
    await prisma.salesOrders.update({
        where: { id: salesId },
        data: {
            pickup: {
                disconnect: true,
                delete: true
            }
        }
    });
    await saveProgress("SalesOrder", salesId, {
        type: "delivery",
        status: "Pickup Cancelled",
        userId: await userId()
    });
    _revalidate("pickup");
}
export async function _createPickup(salesId, pickupData) {
    const order = await prisma.salesOrders.update({
        where: { id: salesId },
        data: {
            pickup: {
                create: {
                    ...pickupData,
                    pickupApprovedBy: await userId(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        },
        include: {
            pickup: true
        }
    });
    await saveProgress("SalesOrder", salesId, {
        type: "delivery",
        status: "Order Pickup",
        userId: await userId(),
        description: `Order pickup by ${order.pickup?.pickupBy}`
    });
    await _revalidate("pickup");
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
    await _revalidate("pickup");
}