"use server";

import { prisma } from "@/db";
import { lastId, nextId } from "@/lib/nextId";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";
import dayjs from "dayjs";
import { _validateOrderId } from "./validate-order-id.dac";

export async function _saveSales(
    _id,
    order: ISalesOrder,
    items: ISalesOrderItem[]
) {
    let orderId = order.orderId;
    let slug = order.slug;
    if (!order.type) order.type = "order";
    order.status = "Active";

    const {
        customerId,
        prodId,
        salesRepId,
        salesRep,
        shippingAddressId,
        billingAddressId,
        createdAt,
        pickupId,
        ..._order
    } = order;
    let id = _id;
    console.log(_order);
    if (!slug && !orderId) {
        const now = dayjs();
        // id = await nextId(prisma.salesOrders);
        slug = orderId = [now.format("YY"), now.format("MMDD"), id].join("-");
        await _validateOrderId(orderId, id);
    }

    const metadata = {
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        ...(_order as any),
        updatedAt: new Date(),
        slug,
        orderId,
        customer: customerId && {
            connect: {
                id: customerId as any,
                // id: undefined,
            },
        },
        shippingAddress: shippingAddressId && {
            connect: {
                id: shippingAddressId as any,
            },
        },
        billingAddress: shippingAddressId && {
            connect: {
                id: billingAddressId as any,
            },
        },
    };
    // if (!salesRepId)
    metadata.salesRep = {
        connect: {
            id: salesRepId,
        },
    };
    let lastItemId: number | undefined = undefined;
    let updatedIds: any[] = [];
    if (_id) {
        lastItemId = await lastId(prisma.salesOrderItems);
    }
    const updateMany = items
        .map((item) => {
            if (!item.id) return null;
            item.updatedAt = new Date();
            const { id, salesOrderId, ...data } = item;
            updatedIds.push(id);
            return {
                where: {
                    id,
                },
                data,
            };
            // return item;
        })
        .filter(Boolean) as any;
    const createMany = {
        data: items
            .map((item) => {
                if (item.id) return null;
                item.createdAt = item.updatedAt = new Date();
                return item;
            })
            .filter(Boolean) as any,
    };
    const sale_order = _id
        ? await prisma.salesOrders.update({
              where: { id },
              data: {
                  ...metadata,
                  items: {
                      updateMany,
                      createMany,
                  },
              },
          })
        : await prisma.salesOrders.create({
              data: {
                  id,
                  ...metadata,
                  items: {
                      createMany,
                  },
              },
          });
    if (_id) {
        const ids = await prisma.salesOrderItems.findMany({
            where: {
                id: {
                    lte: lastItemId,
                    notIn: updatedIds,
                },
                salesOrderId: sale_order.id,
            },
            select: {
                id: true,
            },
        });
        if (ids.length > 0) {
            const _ids = ids.map((i) => i.id);
            await prisma.orderProductionSubmissions.deleteMany({
                where: {
                    salesOrderItemId: {
                        in: _ids,
                    },
                },
            });
            await prisma.salesOrderItems.deleteMany({
                where: {
                    id: {
                        in: _ids,
                    },
                },
            });
        }
    }
    return sale_order;
}
