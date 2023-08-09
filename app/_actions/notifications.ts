"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { SalesOrders } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function loadNotifications() {
  const data = await getServerSession(authOptions);
  const noficiations = await prisma.notifications.findMany({
    where: {
      userId: data?.user?.id,
    },
  });
}
async function _notify() {
  //  await prisma.notifications.create({
  //    data: {
  //      userId: userId,
  //      fromUser: {
  //        connect: {
  //          id: (await myId()) || 0,
  //        },
  //      },
  //      user: {
  //        connect: {
  //          id: userId,
  //        },
  //      },
  //      meta: {},
  //      message: "",
  //    },
  //  });
}
export async function _notifyProductionAssigned(order: SalesOrders) {}
