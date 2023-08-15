"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { SalesOrders } from "@prisma/client";
import { getServerSession } from "next-auth";
import { myId, user } from "./utils";
import { transformData } from "@/lib/utils";
import { formatDate } from "@/lib/use-day";

export async function loadNotifications() {
  const data = await getServerSession(authOptions);
  const noficiations = await prisma.notifications.findMany({
    where: {
      userId: data?.user?.id,
    },
  });
}
export async function getNotificationCountAction() {
  const userId = await myId();
  const count = await prisma.notifications.count({
    where: {
      userId: userId || 0,
      archivedAt: {
        not: null,
      },
    },
  });
  console.log(userId, count);
  return count;
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
