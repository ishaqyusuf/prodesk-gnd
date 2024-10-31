import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import {
    salesAssignmentCreated,
    updateSalesProgressDta,
} from "./sales-progress.dta";
import { excludeDeleted } from "../utils/db-utils";

export async function createItemAssignmentDta(
    data: Prisma.OrderItemProductionAssignmentsCreateInput
) {
    data.qtyAssigned = sum([data.lhQty, data.rhQty]);
    const assignment = await prisma.orderItemProductionAssignments.create({
        data,
    });
    await salesAssignmentCreated(data.order.connect.id, data.qtyAssigned);
}
export async function deleteAssignmentDta(assignmentId) {
    const a = await prisma.orderItemProductionAssignments.update({
        where: {
            id: assignmentId,
        },
        data: {
            deletedAt: new Date(),
            submissions: {
                updateMany: {
                    where: {},
                    data: {
                        deletedAt: new Date(),
                    },
                },
            },
        },
        include: {
            submissions: {
                ...excludeDeleted,
                select: {
                    id: true,
                    qty: true,
                },
            },
        },
    });
    await updateSalesProgressDta(a.orderId, "prod", {
        minusScore: a.qtyAssigned,
    });
    const submissions = a.submissions;
    if (submissions.length) {
        await prisma.orderProductionSubmissions.updateMany({
            where: {
                id: { in: submissions.map((s) => s.id) },
            },
            data: {
                deletedAt: new Date(),
            },
        });
        await updateSalesProgressDta(a.orderId, "prodAssignment", {
            minusScore: sum(submissions.map((s) => s.qty)),
        });
    }
}
export async function submitAssignmentDta(
    data: Prisma.OrderProductionSubmissionsCreateInput
) {
    const c = await prisma.orderProductionSubmissions.create({
        data,
    });
    await updateSalesProgressDta(c.salesOrderId, "prodAssignment", {
        plusScore: c.qty,
    });
}
export async function deleteAssignmentSubmissionDta(submitId, salesId) {
    const submission = await prisma.orderProductionSubmissions.update({
        where: {
            id: submitId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    await updateSalesProgressDta(submission.salesOrderId, "prodAssignment", {
        minusScore: submission.qty,
    });
}
