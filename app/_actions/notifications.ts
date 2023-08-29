"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { SalesOrders, Notifications, Tasks, JobPayments } from "@prisma/client";
import { getServerSession } from "next-auth";
import { userId, user } from "./utils";
import { transformData } from "@/lib/utils";
import { formatDate } from "@/lib/use-day";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";
import { IJobs } from "@/types/hrm";

export type INotification = Notifications & {
  archived: Boolean;
  time;
};
export async function loadNotificationsAction() {
  const id = await userId();
  const noficiations: INotification[] = (await prisma.notifications.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as any;
  return noficiations;
}
export async function getNotificationCountAction() {
  const id = await userId();
  const count = await prisma.notifications.count({
    where: {
      userId: id,
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
export type NotificationType =
  | "sales production"
  | "installation"
  | "punchount";
async function _notify(userId, type: NotificationType, message, link) {
  await prisma.notifications.create({
    data: transformData({
      fromUser: {
        connect: {
          id: (await userId()) || 0,
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
export async function _notifyProductionDateUpdate(order: SalesOrders) {
  if (order.prodId)
    await _notify(
      order.prodId,
      "sales production",
      `Production due date for (${
        order.orderId
      }) has been updated, new date: ${formatDate(order.prodDueDate)}`,
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
export async function _notifyAdminJobSubmitted(job: IJobs) {
  await _notify(
    1,
    job.type as any,
    `New Job Submission: ${job.title} ${job.subtitle}`,
    `/hrm/jobs?id=${job.id}`
  );
}
export async function _notifyWorkerPaymentPaid(
  payment: JobPayments,
  jobCount
) {}
