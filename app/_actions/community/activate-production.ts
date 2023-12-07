"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";
import { serverDate } from "../action-utils";

export async function activateHomeProductionAction(ids: number[], dueDate) {
    // console.log(ids, dueDate);
    await prisma.homeTasks.updateMany({
        where: {
            homeId: {
                in: ids,
            },
            produceable: true,
        },
        data: {
            productionDueDate: serverDate(dueDate),
            sentToProductionAt: new Date(),
        },
    });
}
