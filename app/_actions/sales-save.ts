"use server";

import { prisma } from "@/db";
import { lastId, nextId } from "@/lib/nextId";
import { ISaveOrder } from "@/types/sales";
import dayjs from "dayjs";
import orderProdQtyUpdateAction from "./sales";
import va from "@/lib/va";

export async function saveOrderAction({
  id,
  order,
  items,
  deleteIds,
}: ISaveOrder) {
  // const id= order.id
  // delete order?.id;
  // numeric<SalesOrders>()
  // items = items.map
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
  console.log(slug);
  const metadata = {
    createdAt: new Date(),
    ...(_order as any),
    updatedAt: new Date(),
    slug,
    orderId,
    // customer: customerId && {
    //   connect: {
    //     id: customerId as any,
    //     // id: undefined,
    //   },
    // },
    // shippingAddress: shippingAddressId && {
    //   connect: {
    //     id: shippingAddressId as any,
    //   },
    // },
    // billingAddress: shippingAddressId && {
    //   connect: {
    //     id: billingAddressId as any,
    //   },
    // },
  };
  // Object.entries({
  //   customer: customerId,
  //   shippingAddress: shippingAddressId,
  //   billingAddress: billingAddressId,
  // }).map(([k, v]) => {
  //   v && (metadata[k] = { connect: { id: v } });
  // });
  // console.log(metadata);
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
  if (id) va.track("sales updated", { type: sale_order.type });
  else va.track("sales created", { type: sale_order.type });
  return sale_order;
}
