"use server";

import { SalesQueryParams } from "@/types/sales";
import { getSales, whereSales } from "./sales";
import { prisma } from "@/db";
import { _revalidate } from "../_revalidate";
import { getPageInfo, queryFilter } from "../action-utils";
import { userId } from "../utils";

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
}
export async function _createPickup(salesId, pickup) {
    await prisma.salesOrders.update({
        where: { id: salesId },
        data: {
            pickup: {
                create: {
                    ...pickup,
                    pickupApprovedBy: await userId(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }
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
