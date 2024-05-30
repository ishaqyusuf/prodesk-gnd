"use server";

import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { OrderProductionSubmissions } from "@prisma/client";
import { getOrderAssignmentData } from "./get-order-assignment-data";
import { ServerPromiseType } from "@/types";

type Props = ServerPromiseType<
    typeof getOrderAssignmentData
>["Response"]["doorGroups"][0]["salesDoors"][0]["assignments"][0];

export async function _deleteAssignment(data: Props) {
    const isLeft = data.__report.handle == "LH";
    const k = isLeft ? "lhQty" : "rhQty";

    const { lhQty = 0, rhQty = 0 } = data;

    const _delete = isLeft ? (rhQty || 0) == 0 : (lhQty || 0) == 0;
    const updateData: any = {};
    if (_delete) updateData.deletedAt = new Date();
    else {
        updateData[k] = 0;
    }

    await prisma.orderItemProductionAssignments.update({
        where: { id: data.id },
        data: {
            ...updateData,
            // deletedAt: new Date(),
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
    await _deleteAssignmentSubmissions(data.id, k);
}
export async function _deleteAssignmentSubmission(submissionId) {
    const submissions = await prisma.orderProductionSubmissions.updateMany({
        where: {
            id: submissionId,
            deletedAt: null,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    // await prisma.orderProductionSubmissions.updateMany({
    //     where: {
    //         assignmentId,
    //         [k]: {
    //             gt: 0,
    //         },
    //     },
    //     data: {
    //         deletedAt: new Date(),
    //     },
    // });
    // const salesOrderId = submissions[0]?.salesOrderId;
    // const totalQty = await sum(submissions, "qty");
    // await prisma.salesProductionStatus.update({
    //     where: {
    //         orderId: salesOrderId as any,
    //     },
    //     data: {
    //         score: {
    //             decrement: totalQty,
    //         },
    //     },
    // });
}
export async function _deleteAssignmentSubmissions(
    assignmentId,
    k: "rhQty" | "lhQty"
) {
    console.log(assignmentId, k);

    const submissions = await prisma.orderProductionSubmissions.findMany({
        where: {
            assignmentId,
            deletedAt: null,
            [k]: {
                gt: 0,
            },
        },
    });
    await prisma.orderProductionSubmissions.updateMany({
        where: {
            assignmentId,
            [k]: {
                gt: 0,
            },
        },
        data: {
            deletedAt: new Date(),
        },
    });
    const salesOrderId = submissions[0]?.salesOrderId;
    const totalQty = await sum(submissions, "qty");
    // await prisma.salesProductionStatus.update({
    //     where: {
    //         orderId: salesOrderId as any,
    //     },
    //     data: {
    //         score: {
    //             decrement: totalQty,
    //         },
    //     },
    // });
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
    // await prisma.salesProductionStatus.update({
    //     where: {
    //         orderId: data.salesOrderId as any,
    //     },
    //     data: {
    //         score: {
    //             increment: data.qty,
    //         },
    //     },
    // });
    await prisma.orderItemProductionAssignments.update({
        where: { id: data.assignmentId as any },
        data: {
            qtyCompleted: {
                increment: qty,
            },
        },
    });
}
