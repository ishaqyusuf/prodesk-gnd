"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { WorkOrders } from "@prisma/client";

export async function createCustomerService(data: WorkOrders) {
  await prisma.workOrders.create({
    data: transformData(data) as any,
  });
}
export async function updateCustomerService(id, data: WorkOrders) {
  await prisma.workOrders.update({
    where: { id },
    data: transformData(data) as any,
  });
}
