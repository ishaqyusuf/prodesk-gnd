"use server";

import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { OrderProductionSubmissions } from "@prisma/client";

export async function _deleteAssignment(id) {
    await prisma.orderItemProductionAssignments.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            // submissions: {
            //     updateMany: {
            //         where: {
            //             deletedAt: null,
            //         },
            //         data: {
            //             deletedAt: new Date(),
            //         },
            //     },
            // },
        },
    });
    await _deleteAssignmentSubmissions(id);
}
export async function _deleteAssignmentSubmissions(assignmentId, ids?) {
    const submissions = await prisma.orderProductionSubmissions.findMany({
        where: {
            id: ids
                ? {
                      in: ids,
                  }
                : undefined,
            assignmentId,
            deletedAt: null,
        },
    });
    await prisma.orderProductionSubmissions.updateMany({
        where: {
            id: { in: ids },
            assignmentId,
        },
        data: {
            deletedAt: new Date(0),
        },
    });
    const salesOrderId = submissions[0]?.salesOrderId;
    const totalQty = await sum(submissions, "qty");
    await prisma.salesProductionStatus.update({
        where: {
            orderId: salesOrderId as any,
        },
        data: {
            score: {
                decrement: totalQty,
            },
        },
    });
}
export async function _submitProduction(
    data: Partial<OrderProductionSubmissions>
) {
    const qty = sum([data.lhQty, data.rhQty]);
    data.qty = qty;
    const s = await prisma.orderProductionSubmissions.create({
        data: {
            ...(data as any),
        },
    });
    await prisma.salesProductionStatus.update({
        where: {
            orderId: data.salesOrderId as any,
        },
        data: {
            score: {
                increment: data.qty,
            },
        },
    });
    await prisma.orderItemProductionAssignments.update({
        where: { id: data.assignmentId as any },
        data: {
            qtyCompleted: {
                increment: qty,
            },
        },
    });
}
