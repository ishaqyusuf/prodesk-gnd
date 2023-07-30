"use server";

import { prisma } from "@/db";
import dayjs from "dayjs";

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
