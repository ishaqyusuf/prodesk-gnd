"use server";

import { authId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import {
    updateQtyControlAction,
    updateSalesItemControlAction,
} from "./item-control.action";
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
export async function deleteItemAssignmentAction({ id }) {
    return await prisma.$transaction((async (tx: typeof prisma) => {
        const a = await prisma.orderItemProductionAssignments.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        await updateSalesItemControlAction(a.orderId);
        await updateSalesStatControlAction(a.orderId);
    }) as any);
}
export async function submitItemAssignmentAction({
    uid,
    totalQty,
    qty,
    rh,
    lh,
    salesId,
    assignmentId,
    salesItemId,
}) {
    return await prisma.$transaction((async (tx: typeof prisma) => {
        await tx.orderProductionSubmissions.create({
            data: {
                lhQty: lh,
                rhQty: rh,
                qty,
                assignment: {
                    connect: {
                        id: assignmentId,
                    },
                },
                order: {
                    connect: {
                        id: salesId,
                    },
                },
                item: {
                    connect: {
                        id: salesItemId,
                    },
                },
            },
        });
        await updateQtyControlAction(uid, "prodCompleted", {
            totalQty,
            qty,
            rh,
            lh,
        });
        await updateSalesStatControlAction(salesId);
    }) as any);
}
export async function deleteSubmissionAction({ id }) {
    return await prisma.$transaction((async (tx: typeof prisma) => {
        const resp = await tx.orderProductionSubmissions.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        // await updateQtyControlAction(uid, "prodCompleted", {
        //     totalQty,
        //     qty: !resp.lhQty && !resp.rhQty ? resp.qty * -1 : 0,
        //     rh: resp.lhQty * -1,
        //     lh: resp.rhQty * -1,
        // });
        // await updateSalesStatControlAction(resp.salesOrderId);
        await updateSalesItemControlAction(resp.salesOrderId);
        await updateSalesStatControlAction(resp.salesOrderId);
    }) as any);
}
