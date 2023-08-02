"use server";

import { prisma } from "@/db";
import { ActionResponse } from "@/types/action";
import {
  ISalesOrder,
  ISalesOrderItem,
  ProdActionProps,
  SalesQueryParams,
} from "@/types/sales";
import dayjs from "dayjs";
import orderProdQtyUpdateAction, { getSales } from "./sales";
import { saveProgress } from "./progress";

export async function getSalesProductionsAction(
  query: SalesQueryParams
): ActionResponse<ISalesOrder> {
  query._page = "production";
  return await getSales(query);
}
export async function adminCompleteProductionAction(id) {
  await prisma.salesOrders.update({
    where: {
      id,
    },
    data: {
      prodDueDate: null,
      prodId: null,
      //   builtQty
    },
  });
}
export async function cancelProductionAssignmentAction(id) {
  await prisma.salesOrders.update({
    where: {
      id,
    },
    data: {
      prodDueDate: null,
      prodId: null,
    },
  });
}
export interface AssignProductionActionProps {
  id;
  userId;
  prodDueDate;
}
export async function assignProductionAction({
  id,
  userId,
  prodDueDate,
}: AssignProductionActionProps) {
  await prisma.salesOrders.update({
    where: {
      id,
    },
    data: {
      prodDueDate,
      prodId: userId,
    },
  });
}
export interface UserProductionEventsProps {
  userId;
  date;
}
export async function getUserProductionEventsAction({
  userId,
  date,
}: UserProductionEventsProps) {
  const [gte, lte] = [
    dayjs(date)
      .startOf("month")
      .toISOString(),
    dayjs(date)
      .endOf("month")
      .toISOString(),
  ];
  const prods = await prisma.salesOrders.findMany({
    where: {
      prodId: userId,
      prodDueDate: {
        gte,
        lte,
      },
      prodStatus: {
        notIn: ["Completed"],
      },
    },
    orderBy: {
      prodDueDate: "asc",
    },
    select: {
      prodDueDate: true,
      orderId: true,
      prodStatus: true,
      id: true,
    },
  });
  //   console.log(prods);
  return prods;
}
export async function orderItemProductionAction({
  itemId,
  note,
  qty,
  action,
}: ProdActionProps) {
  const item: ISalesOrderItem = (await prisma.salesOrderItems.findFirst({
    where: {
      id: itemId,
    },
    // include: {
    //   // salesOrder: {
    //   //   include: {
    //   //     items: true,
    //   //   },
    //   // },
    // },
  })) as any;
  if (!item) return null;

  const _update: ISalesOrderItem = {
    meta: {
      ...((item.meta ?? {}) as any),
    },
  } as any;
  // if (!_update.salesOrder?.prodQty) {
  //   await updateOrderProdQty(_update.salesOrder);
  // }

  const producedQty = _update.meta.produced_qty || 0;
  switch (action) {
    case "Stop":
      _update.meta.produced_qty = null;
      await updateProgress(item, qty, "Production Stopped");
      break;
    case "Start":
      _update.meta.produced_qty = 0;
      await updateProgress(item, qty, "Production Started");
      break;
    case "Complete":
      _update.meta.produced_qty = producedQty + qty;
      await prisma.orderProductionSubmissions.create({
        data: {
          qty,
          meta: {
            note,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          salesOrderId: item.salesOrderId,
          salesOrderItemId: item.id,
        },
      });
      await updateProgress(item, qty, "Production Submitted");

      break;
    case "Cancel":
      _update.meta.produced_qty = producedQty - qty;
      await updateProgress(item, qty, "Production Cancelled");

      break;
  }
  await prisma.salesOrderItems.update({
    where: {
      id: itemId as any,
    },
    data: {
      ..._update,
    } as any,
  });
  // if (action == "Cancel")
  await orderProdQtyUpdateAction(item.salesOrderId);
}

async function updateProgress(item, qty, status) {
  let headline = [qty, item.description].filter(Boolean).join(" ");

  await saveProgress("SalesOrderItem", item.id, {
    type: "production",
    parentId: item.salesOrderId,
    status,
    headline,
    userId: item.salesOrder?.prodId,
  });
}
