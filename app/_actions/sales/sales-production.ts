"use server";

import { prisma } from "@/db";
import { TableApiResponse } from "@/types/action";
import {
  ISalesOrder,
  ISalesOrderItem,
  ISalesOrderItemMeta,
  ProdActionProps,
  SalesQueryParams,
} from "@/types/sales";
import dayjs from "dayjs";
import orderProdQtyUpdateAction, { getSales } from "./sales";
import { saveProgress } from "../progress";
import { getServerSession } from "next-auth";
import { myId } from "../utils";
import {
  _notifyProdStarted,
  _notifyProductionAssigned,
  _notifyProductionDateUpdate,
} from "../notifications";
import { formatDate } from "@/lib/use-day";
import { deepCopy } from "@/lib/deep-copy";

export async function getSalesProductionsAction(
  query: SalesQueryParams,
  admin = false
): TableApiResponse<ISalesOrder> {
  const sessionId = await myId();
  query._page = "production";
  if (!admin) query.prodId = sessionId || -1;
  if (!query._dateType) query._dateType = "prodDueDate";
  if (!query.sort) {
    query.sort = "prodDueDate";
    query.sort_order = "desc";
  }
  return await getSales(query);
}
export async function prodsDueToday(admin: Boolean) {
  const q: SalesQueryParams = {
    _page: "production",
    date: formatDate(dayjs(), "YYYY-MM-DD"),
    _dateType: "prodDueDate",
  };
  const sessionId = await myId();
  if (!admin) q.prodId = sessionId || -1;

  return await getSales(q);
}
export async function adminCompleteProductionAction(id) {
  await markProduction(id, "completed");
}
export async function markProductionIncompleteAction(id) {
  await markProduction(id, "incomplete");
}
export async function markProduction(id, as: "completed" | "incomplete") {
  const completed = as == "completed";
  let prevProducedQty: number = 0;
  const order = await prisma.salesOrders.findFirst({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });
  if (!order) throw Error("Order not found");
  console.log(order.items.length);
  order.items.map(async (item) => {
    console.log(item.swing, item.qty, ">>>>");
    if (!item.swing || !item?.qty || !item) return;
    const meta: ISalesOrderItemMeta = item.meta as any;
    if (completed)
      prevProducedQty += (item.qty || 0) - (meta.produced_qty || 0);
    else prevProducedQty += meta.produced_qty || 0;

    meta.produced_qty = completed ? item.qty : 0;
    console.log([meta.produced_qty]);
    await prisma.salesOrderItems.update({
      where: {
        id: item.id,
      },
      data: {
        meta: meta as any,
      },
    });
  });
  if (prevProducedQty > 0) {
    await saveProgress("SalesOrder", id, {
      type: "production",
      // parentId: salesOrderId,
      status: completed ? "Production Completed" : "Production Reset",
      headline: completed
        ? "Production Completed by admin"
        : "Production Reset by admin",
      userId: await myId(),
    });
  }
  await orderProdQtyUpdateAction(id);
  if (order?.prodId && !completed) await _notifyProductionAssigned(order);
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
  const order = await prisma.salesOrders.update({
    where: {
      id,
    },
    data: {
      prodDueDate,
      prodId: userId,
    },
  });
  await _notifyProductionAssigned(order);
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
  order,
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
      _update.meta.produced_qty = undefined;
      await updateProgress(item, qty, "Production Stopped");
      break;
    case "Start":
      _update.meta.produced_qty = 0;
      await updateProgress(item, qty, "Production Started");
      await _notifyProdStarted(item, order);
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
export async function updateProductionDate(orderId, newDate) {
  const order = await prisma.salesOrders.update({
    where: { id: newDate },
    data: {
      prodDueDate: newDate,
    },
  });
  await _notifyProductionDateUpdate(order);
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
