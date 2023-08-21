"use server";

import {
  dateQuery,
  getPageInfo,
  queryFilter,
} from "@/app/_actions/action-utils";
import { prisma } from "@/db";
import { lastId, nextId } from "@/lib/nextId";
import { convertToNumber } from "@/lib/use-number";
import { TableApiResponse } from "@/types/action";
import {
  CopyOrderActionProps,
  IOrderPrintMode,
  ISalesOrder,
  ISalesOrderItem,
  ISalesOrderItemMeta,
  SalesQueryParams,
  SaveOrderActionProps,
  UpdateOrderPriorityProps,
} from "@/types/sales";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { getProgress } from "../progress";
import { fixSalesPaymentAction } from "./sales-payment";
import { removeEmptyValues } from "@/lib/utils";

  function whereSales(query: SalesQueryParams) {
  const {
    _q,
    _dateType = "createdAt",
    status,
    date,
    from,
    to,
    prodId,
    type = "order",
  } = query;
  const inputQ = { contains: _q || undefined };
  const where: Prisma.SalesOrdersWhereInput = {
    OR: [
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
            } 
          ]
        },
      },
      {
         shippingAddress: {
          address1: inputQ
        }
      },
      {
        producer: {
          name: inputQ
        }
      }
    ],
    type,
    ...dateQuery({ from, to, _dateType, date }),
  };
  if (prodId) where.prodId = prodId;
  if (status) {
    const statusIsArray = Array.isArray(status);
    if(status == 'Unassigned')
      where.prodId = null;
    else
    where.prodStatus = {
      equals: statusIsArray ? undefined : status,
      in: statusIsArray ? status : undefined,
    };
  }
  if (query._page == "production") {
    if (!prodId) { 
      where.prodId = {
        gt: 1,
      };
    }
  } 
  return where;
}
export async function getSalesOrder(
  query: SalesQueryParams
): TableApiResponse<ISalesOrder> {
  query.type = "order";
return await getSales(query) 
}
export async function getOrderAction(orderId,isProd = false) {
    const order = await prisma.salesOrders.findFirst({
    where: {
      orderId,
      // type: {
      //   notIn: ["estimate"],
      // },
    },
    include: {
      customer: true,
      items: {
        // orderBy: {
        //   swing: "desc",
        // },
      },
      billingAddress: true,
      producer: true,
      salesRep: true,
      shippingAddress: true,
      payments: !isProd,
      productions: isProd,
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
  function lineIndex(line)
  {
    return Number(line?.meta?.line_index || line?.meta?.uid || 0); 
  }
  return {
    ...order,
    items: order.items.sort((a,b) => lineIndex(a) - lineIndex(b)),
    progress,
  };
}
export async function getSalesEstimates(
  query: SalesQueryParams
): TableApiResponse<ISalesOrder> {
  query.type = "estimate";
return await getSales(query) 
}
export async function getSales(query: SalesQueryParams) {
 
 const where = whereSales(query);
//  console.log
  const _items = await prisma.salesOrders.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      customer: true,
      shippingAddress: true,
      producer: true,
      salesRep: true,
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
}: SaveOrderActionProps) {
  let orderId = order.orderId;
  let slug = order.slug;
  if (!order.type) order.type = "order";
  order.status = "Active";
  const {
    customerId,
    prodId,
    salesRepId,
    shippingAddressId,
    billingAddressId,
    ..._order
  } = order;

  if (!id) {
    const now = dayjs();
    slug = orderId = [
      now.format("YY"),
      now.format("MMDD"),
      await nextId(prisma.salesOrders),
    ].join("-");
  }

  const metadata = {
    createdAt: new Date(),
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
  if (!id && salesRepId)
    metadata.salesRep = {
      connect: {
        id: salesRepId,
      },
    };
  let lastItemId: number | undefined = undefined;
  let updatedIds: any[] = [];
  if (id) {
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
  const sale_order = id
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
          ...metadata,
          createdAt: new Date(),
          items: {
            createMany,
          },
        },
      });
  if (id) {
    await prisma.salesOrderItems.deleteMany({
      where: {
        id: {
          lte: lastItemId,
          notIn: updatedIds,
        },
        salesOrderId: sale_order.id,
      },
    });
  }
  await orderProdQtyUpdateAction(sale_order.id);
  console.log(sale_order)
  return sale_order;
}
export async function deleteOrderAction(id) {
  await prisma.salesOrderItems.deleteMany({
    where: {
      salesOrderId: id
    }
  })
  await prisma.salesOrders.delete({
    where: {id},
    include: {
      items: true
    }
  })
  
}
export default async function orderProdQtyUpdateAction(salesOrderId) {
  let prodQty = 0;
  let builtQty = 0;
  let order = await prisma.salesOrders.findUnique({
    where: {
      id: salesOrderId,
    },
    include: {
      items: {
        select: {
          swing: true,
          qty: true,
          meta: true,
        },
      },
    },
  });
  const _startedItems = (order?.items as ISalesOrderItem[])?.filter(
    (i) => i.swing && typeof i.meta.produced_qty === "number"
  );
    const started = _startedItems?.length > 0;
    if (order != null)
    order.items.map((item) => {
      let {
        qty,
        swing,
        meta: { produced_qty },
      } = item as ISalesOrderItem;
      qty ||= 0;
      produced_qty ||= 0;
      if (swing && qty > 0) {
        prodQty += convertToNumber(qty);
        builtQty += convertToNumber(produced_qty);
      }
    });
  let prodStatus = order?.prodStatus;
  if (order?.prodId) {
    prodStatus = "Queued";
  }
    if (started) prodStatus = "Started";
    if (prodQty == builtQty && (builtQty > 0 || prodQty == 0)) prodStatus = "Completed";
  await prisma.salesOrders.update({
    where: {
      id: salesOrderId,
    },
    data: {
      builtQty,
      prodQty,
      prodStatus,
    },
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
  )[0] as ISalesOrder;
  meta.priority = priority;
  await prisma.salesOrders.update({
    where: {
      id,
    },
    data: {
      meta,
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
    amountDue,
    invoiceStatus,
    prodStatus,
    prodId,
    builtQty,
    createdAt,
    updatedAt,
    goodUntil,
    paymentTerm,
    items: cItems,
    ...orderData
  } = _cloneData;
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
export async function salesPrintAction({ ids,printMode }: { ids: number[],printMode:IOrderPrintMode }) {
  if(printMode == 'order')
  await Promise.all(
    ids.map(async(id) => {
      await fixSalesPaymentAction(Number(id))
    })
  )
  const sales = prisma.salesOrders.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      items: {},
      salesRep: {},
      billingAddress: {},
      shippingAddress: {},
      payments:true
    },
  });
  return sales;
}
export async function moveEstimateToOrderAction(id) {

    await prisma.salesOrders.update({
      where:{
        id
      },
      data: {
        type: 'order'
      }
    })
}