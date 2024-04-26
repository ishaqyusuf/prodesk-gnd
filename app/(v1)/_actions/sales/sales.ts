"use server";

import {
    dateQuery,
    getPageInfo,
    queryFilter,
} from "@/app/(v1)/_actions/action-utils";
import { prisma } from "@/db";
import { lastId, nextId } from "@/lib/nextId";
import { convertToNumber } from "@/lib/use-number";
import { TableApiResponse } from "@/types/action";
import {
    CopyOrderActionProps,
    IOrderPrintMode,
    ISalesType,
    ISalesOrder,
    ISalesOrderItem,
    ISalesOrderItemMeta,
    SalesQueryParams,
    SaveOrderActionProps,
    UpdateOrderPriorityProps,
} from "@/types/sales";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { getProgress, saveProgress } from "../progress";
import { fixSalesPaymentAction } from "./sales-payment";
import { removeEmptyValues } from "@/lib/utils";
import { user, userId } from "../utils";
import { revalidatePath } from "next/cache";
import { _revalidate } from "../_revalidate";
import { _saveSales } from "@/app/(v2)/(loggedIn)/sales/_data-access/save-sales.persistence";
import { _updateProdQty } from "@/app/(v2)/(loggedIn)/sales/_data-access/update-prod-qty.dac";

export async function whereSales(query: SalesQueryParams) {
    const {
        _q,
        _dateType = "createdAt",
        status,
        date,
        from,
        to,
        prodId,
        _payment,
        _deliveryStatus,
        deliveryOption,
        // isDyke,
        type = "order",
    } = query;
    const inputQ = { contains: _q || undefined } as any;
    const where: Prisma.SalesOrdersWhereInput = {
        deletedAt: null,
        // isDyke,
        OR: !_q
            ? undefined
            : [
                  { orderId: inputQ },
                  {
                      customer: {
                          OR: [
                              {
                                  name: inputQ,
                              },
                              {
                                  email: inputQ,
                              },
                              {
                                  phoneNo: inputQ,
                              },
                          ],
                      },
                  },
                  {
                      shippingAddress: {
                          address1: inputQ,
                      },
                  },
                  {
                      producer: {
                          name: inputQ,
                      },
                  },
                  {
                      items: {
                          some: {
                              description: inputQ,
                          },
                      },
                  },
              ],
        type,
        ...dateQuery({ from, to, _dateType, date }),
    };
    if (_q && Number(_q) > 0) {
        // console.log(_q)
        where.OR?.push({
            grandTotal: {
                gte: Number(_q),
                lt: Number(_q) + 2,
            },
        });
    }
    if (query._backOrder)
        where.orderId = {
            endsWith: "-bo",
        };
    if (query._noBackOrder)
        where.orderId = {
            not: {
                endsWith: "-bo",
            },
        };
    if (query.deliveryOption) where.deliveryOption = query.deliveryOption;
    if (prodId) where.prodId = prodId;
    if (status) {
        const statusIsArray = Array.isArray(status);
        if (status == "Unassigned") where.prodId = null;
        else if (status == "Inbound") {
            where.prodId = {
                gt: 0,
            };
            // where.prod
        } else if (status == "Late") {
            where.prodStatus = {
                notIn: ["Completed"],
            };
            where.prodDueDate = {
                lt: dayjs().subtract(1).toISOString(),
            };
        } else
            where.prodStatus = {
                equals: statusIsArray ? undefined : status,
                in: statusIsArray ? status : undefined,
            };
    }
    if (query.statusNot)
        where.status = {
            not: query.statusNot,
        };
    if (_payment == "Paid") where.amountDue = 0;
    else if (_payment == "Pending")
        where.amountDue = {
            gt: 0,
        };
    if (query._page == "production") {
        if (!prodId) {
            where.prodId = {
                gt: 1,
            };
        }
    }
    if (query._customerId) where.customerId = +query._customerId;
    switch (_deliveryStatus) {
        case "delivered":
            // where.OR?.push({
            //     OR: [
            //         {deliveredAt: {not: ''}},
            //     ]
            // })
            where.status = "Delivered";
            break;
        case "queued":
            where.prodStatus = "Completed";
            where.status = {
                notIn: ["In Transit", "Return", "Delivered", "Ready"],
            };
            break;
        case "pending production":
            if (!where.OR) where.OR = [];

            where.OR.push({
                OR: [
                    {
                        prodStatus: {
                            notIn: ["Completed"],
                        },
                    },
                    {
                        prodStatus: null,
                    },
                ],
            });
            // where.prodStatus = {
            //     notIn: ["Completed"],
            // };
            break;
        case "ready":
            where.status = "Ready";
            // where.status = {
            //   notIn: ['In Transit','Return','Delivered']
            // }
            break;
        case "transit":
            where.status = "In Transit";
            break;
    }
    if (query._salesRepId) where.salesRepId = +query._salesRepId;
    return where;
}
export async function getSalesOrder(
    query: SalesQueryParams
): TableApiResponse<ISalesOrder> {
    query.type = "order";
    return await getSales(query);
}
export async function _getInboundOrders(
    query: SalesQueryParams
): TableApiResponse<ISalesOrder> {
    //   query.type = "order";
    return await getSales(query);
}
export async function getOrderAction(orderId, isProd = false) {
    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId,
            // type: {
            //   notIn: ["estimate"],
            // },
        },
        include: {
            customer: {
                include: {
                    wallet: true,
                },
                // wallet: true
            },
            items: {
                include: {},
                // orderBy: {
                //   swing: "desc",
                // },
            },
            billingAddress: true,
            producer: true,
            salesRep: true,
            shippingAddress: true,
            payments: !isProd
                ? {
                      orderBy: {
                          createdAt: "desc",
                      },
                  }
                : false,
            productions: isProd,
            itemDeliveries: true,
        },
    });
    if (!order) return null;
    const progress = await getProgress({
        where: [
            {
                progressableId: order.id,
                progressableType: "SalesOrder",
                type: "production",
            },
            {
                parentId: order.id,
                progressableType: "SalesOrderItem",
                type: isProd ? "production" : undefined,
            },
        ],
    });
    function lineIndex(line) {
        return Number(line?.meta?.line_index || line?.meta?.uid || 0);
    }
    return {
        ...order,
        items: order.items.sort((a, b) => lineIndex(a) - lineIndex(b)),
        progress,
    };
}
export async function getSalesEstimates(
    query: SalesQueryParams
): TableApiResponse<ISalesOrder> {
    query.type = "quote";
    return await getSales(query);
}
export async function getSales(query: SalesQueryParams) {
    const where = await whereSales(query);
    //  console.log
    const _items = await prisma.salesOrders.findMany({
        where,
        ...(await queryFilter(query)),
        include: {
            customer: true,
            shippingAddress: true,
            producer: true,
            salesRep: true,
            pickup: true,
            items: {
                where: {
                    swing: {
                        not: null,
                    },
                },
                select: {
                    description: true,
                    prebuiltQty: true,
                    id: true,
                    qty: true,
                    prodCompletedAt: true,
                    meta: true,
                },
            },
        },
    });
    const pageInfo = await getPageInfo(query, where, prisma.salesOrders);
    return {
        pageInfo,
        data: _items as any,
    };
}
export async function saveOrderAction({
    id,
    order,
    items,
    autoSave,
}: SaveOrderActionProps) {
    const _order = await _saveSales(id, order as any, items);
    await _updateProdQty(_order.id);
    //  console.log(_order)
    //   console.log(sale_order)
    // if (!autoSave || !id)
    // revalidatePath(`/sales/${_order.type}/[slug]/form`, "page");
    return _order;
}
export async function deleteOrderAction(id) {
    await prisma.salesOrders.updateMany({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return;
    await prisma.orderProductionSubmissions.deleteMany({
        where: {
            salesOrderId: id,
        },
    });
    await prisma.salesPayments.deleteMany({
        where: {
            orderId: id,
        },
    });
    await prisma.salesOrderItems.deleteMany({
        where: {
            salesOrderId: id,
        },
    });
    await prisma.salesOrders.deleteMany({
        where: { id },
    });
}

export async function updateOrderPriorityActon({
    priority,
    orderId,
}: UpdateOrderPriorityProps) {
    const { id, meta } = (
        await prisma.salesOrders.findMany({
            where: {
                orderId,
            },
        })
    )[0] as any as ISalesOrder;
    meta.priority = priority;
    await prisma.salesOrders.update({
        where: {
            id,
        },
        data: {
            meta: meta as any,
        },
    });
}

export async function copyOrderAction({ orderId, as }: CopyOrderActionProps) {
    const items = [];
    const _cloneData: ISalesOrder = (await prisma.salesOrders.findFirst({
        where: {
            orderId,
        },
        include: {
            items: true,
        },
    })) as any;
    const {
        orderId: oldOrderId,
        id,
        status,
        slug,
        // amountDue,
        invoiceStatus,
        prodStatus,
        prodId,
        // salesRepId,
        builtQty,
        createdAt,
        updatedAt,
        goodUntil,
        deliveredAt,
        paymentTerm,
        inventoryStatus,
        items: cItems,
        ...orderData
    } = _cloneData;
    orderData.salesRepId = await userId();
    orderData.amountDue = orderData.grandTotal;
    orderData.type = as;
    orderData.prodDueDate = null;
    return await saveOrderAction({
        order: orderData as any,
        items: cItems?.map((i) => {
            const {
                id,
                salesOrderId,
                createdAt,
                updatedAt,
                meta, //: { produced_qty, ..._meta },
                truckLoadQty,
                ...item
            } = i;
            const { produced_qty, ..._meta } = meta as ISalesOrderItemMeta;
            return {
                ...item,
                meta: removeEmptyValues(_meta),
            };
        }) as any,
    });
}
export async function salesPrintAction({
    ids,
    printMode,
}: {
    ids;
    printMode: IOrderPrintMode;
}) {
    const isId = ids.every((id) => typeof id === "number");
    if (printMode == "order" && isId)
        await Promise.all(
            ids.map(async (id) => {
                await fixSalesPaymentAction(Number(id));
            })
        );
    const where: Prisma.SalesOrdersWhereInput = {
        deletedAt: null,
    };
    if (isId) where.id = { in: ids };
    else
        where.slug = {
            in: ids as any,
        };
    const sales = prisma.salesOrders.findMany({
        where,
        include: {
            items: {},
            salesRep: {},
            billingAddress: {},
            shippingAddress: {},
            payments: true,
        },
    });
    return sales;
}
export async function moveSales(id, type: ISalesType) {
    const order = await prisma.salesOrders.update({
        where: {
            id,
        },
        data: {
            type,
        },
    });
    let title = `Moved to ${type}`;
    await saveProgress("SalesOrder", id, {
        type: "sales",
        status: title,
        headline: `${title} by ${(await user()).name}`,
    });
    _revalidate(type == "order" ? "orders" : "quotes");
}
