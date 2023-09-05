"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";
import { serverDate } from "../action-utils";

export async function activateHomeProductionAction(ids: number[], dueDate) {
  await prisma.homeTasks.updateMany({
    where: {
      homeId: {
        in: ids,
      },
    },
    data: {
      productionDueDate: serverDate(dueDate),
      sentToProductionAt: new Date(),
    },
  });
}
