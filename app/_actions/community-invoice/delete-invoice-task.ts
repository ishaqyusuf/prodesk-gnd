"use server";

import { prisma } from "@/db";

export async function deleteInvoiceTask(id) {
  await prisma.homeTasks.delete({
    where: {
      id,
    },
  });
}
