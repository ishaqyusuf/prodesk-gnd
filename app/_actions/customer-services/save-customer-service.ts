"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { WorkOrders } from "@prisma/client";
import dayjs from "dayjs";

export async function createCustomerService(data: WorkOrders) {
  await prisma.workOrders.create({
    data: transformData(data) as any,
  });
}
export async function updateCustomerService(_data: WorkOrders) {
  const { id, techId, ...data } = _data;
  await prisma.workOrders.update({
    where: { id },
    data: transformData(data, true) as any,
  });
}
