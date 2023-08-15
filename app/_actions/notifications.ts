"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { SalesOrders, Notifications } from "@prisma/client";
import { getServerSession } from "next-auth";
import { myId, user } from "./utils";
import { transformData } from "@/lib/utils";
import { formatDate } from "@/lib/use-day";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";

export type INotification = Notifications & {
  archived: Boolean;
  time;
};
export async function loadNotificationsAction() {
  const userId = await myId();
  const noficiations: INotification[] = (await prisma.notifications.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as any;
  return noficiations;
}
export async function getNotificationCountAction() {
  const userId = await myId();
  const count = await prisma.notifications.count({
    where: {
      userId,
      archivedAt: {
        equals: undefined,
      },
    },
  });
  return count;
}

export async function markAsReadAction(id) {
  await prisma.notifications.update({
    where: {
      id,
    },
    data: {
      seenAt: new Date(),
    },
  });
}
export async function archiveAction(id) {
  await prisma.notifications.update({
    where: {
      id,
    },
    data: {
      archivedAt: new Date(),
    },
  });
}
export type NotificationType = "sales production";
async function _notify(userId, type: NotificationType, message, link) {
  await prisma.notifications.create({
    data: transformData({
      fromUser: {
        connect: {
          id: (await myId()) || 0,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      meta: {},
      message,
      type,
      link,
    }),
  });
}
export async function _notifyProdStarted(
  item: ISalesOrderItem,
  order: { orderId; slug; id }
) {
  const me = await user();
  await _notify(
    1,
    "sales production",
    `Production Started: ${item?.description}. by ${me.name}`,
    `/tasks/sales-production/${order.orderId}`
  );
}
export async function _notifyProductionAssigned(order: SalesOrders) {
  // const me = await user();
  await _notify(
    order.prodId,
    "sales production",
    `Order (${
      order.orderId
    }) has been assigned to you for production. Due date: ${formatDate(
      order.prodDueDate
    )}`,
    `/tasks/sales-production/${order.orderId}`
  );
}
