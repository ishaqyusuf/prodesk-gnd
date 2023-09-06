"use server";

import { prisma } from "@/db";

export async function getCustomerService(id) {
  const wo = await prisma.workOrders.findFirst({
    where: { id },
    include: {
      tech: true,
    },
  });
  return wo;
}
export async function deleteCustomerService(id) {
  await prisma.workOrders.delete({
    where: { id },
  });
}
