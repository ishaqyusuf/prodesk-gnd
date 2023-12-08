"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";
import { serverDate } from "../action-utils";
import { _revalidate } from "../_revalidate";

export async function activateHomeProductionAction(ids: number[], dueDate) {
    // console.log(ids, dueDate);
    const u = await prisma.homeTasks.updateMany({
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
    // console.log(u, dueDate);
}
export async function deactivateProduction(ids: number[]) {
    const u = await prisma.homeTasks.updateMany({
        where: {
            homeId: {
                in: ids,
            },
            produceable: true,
        },
        data: {
            productionDueDate: null,
            sentToProductionAt: null,
        },
    });
    _revalidate("homes");
}
