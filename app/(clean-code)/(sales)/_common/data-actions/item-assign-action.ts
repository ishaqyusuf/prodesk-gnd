"use server";

import { authId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { updateQtyControlAction } from "./item-control.action";
import { updateSalesStatControlAction } from "./sales-stat-control.action";

export async function createItemAssignmentAction({
    salesItemId,
    assignedToId,
    doorId = null,
    salesId,
    lh,
    rh,
    qty,
    dueDate,
    uid,
    totalQty,
}) {
    return await prisma.$transaction((async (tx: typeof prisma) => {
        await tx.orderItemProductionAssignments.create({
            data: {
                salesDoor: doorId
                    ? {
                          connect: { id: doorId },
                      }
                    : undefined,
                order: {
                    connect: { id: salesId },
                },
                lhQty: sum([lh]),
                rhQty: sum([rh]),
                qtyAssigned: qty ? sum([qty]) : sum([lh, rh]),
                assignedTo: assignedToId
                    ? {
                          connect: { id: assignedToId },
                      }
                    : undefined,
                item: {
                    connect: { id: salesItemId },
                },
                dueDate,
                assignedBy: {
                    connect: {
                        id: await authId(),
                    },
                },
            },
        });
        await updateQtyControlAction(uid, "prodAssigned", {
            totalQty,
            qty,
            rh,
            lh,
        });
        await updateSalesStatControlAction(salesId);
    }) as any);
}
