"use server";

import { TruckLoaderForm } from "@/components/sales/load-delivery/load-delivery";
import { prisma } from "@/db";
import { _createSalesBackOrder } from "./_sales-back-order";
import { ISalesOrderMeta } from "@/types/sales";

export async function _startSalesDelivery(data: TruckLoaderForm) {
    return await Promise.all(
        Object.entries(data.loader).map(async ([slug, order]) => {
            const _order = await prisma.salesOrders.findFirst({
                where: {
                    slug
                },
                include: {
                    items: true,
                    payments: {
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            });
            if (order.hasBackOrder) {
                //handle back-order
                if (_order) {
                    return await _createSalesBackOrder(_order as any, data);
                }
            }
            //no-back order
            return { slug, msg: "no back-order" };
            await prisma.salesOrders.updateMany({
                where: {
                    slug
                },
                data: {
                    status: "In Transit",
                    meta: ({
                        ...((_order?.meta || {}) as any),
                        truckLoadLocation: order.truckLoadLocation
                    } as ISalesOrderMeta) as any,
                    updatedAt: new Date()
                }
            });
        })
    );
}
