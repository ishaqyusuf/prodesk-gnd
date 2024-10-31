"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import { LineItemOverview } from "../data-access/dto/sales-item-dto";

import { userId } from "@/app/(v1)/_actions/utils";
import { OrderProductionSubmissions, Prisma } from "@prisma/client";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { revalidatePath } from "next/cache";
import {
    createItemAssignmentDta,
    deleteAssignmentDta,
    deleteAssignmentSubmissionDta,
    submitAssignmentDta,
} from "../data-access/sales-prod.dta";

export type ItemAssignmentForm = AsyncFnType<
    typeof getItemAssignmentFormUseCase
>;
export async function getItemAssignmentFormUseCase(item: LineItemOverview) {
    const pendingAssignments = item?.analytics?.pending?.assignment;
    return {
        assignedBy: {
            connect: {
                id: await userId(),
            },
        },
        assignedTo: {
            connect: {
                id: undefined,
            },
        },
        lhQty: pendingAssignments.lh,
        rhQty: pendingAssignments?.rh,
        qtyAssigned: null,
        dueDate: null,
        salesDoor: !item.doorItemId
            ? undefined
            : {
                  connect: {
                      id: item.doorItemId,
                  },
              },
        item: {
            connect: {
                id: item.salesItemId,
            },
        },
        order: {
            connect: {
                id: item.orderId,
            },
        },
        qtyCompleted: 0,
        note: "",
    } satisfies Prisma.OrderItemProductionAssignmentsCreateInput;
}
export async function createItemAssignmentUseCase(data: ItemAssignmentForm) {
    await createItemAssignmentDta(data);
    // await _revalidate('sales')
    revalidatePath("/sales-book/orders");
}
export type AssignmentSubmitForm = OrderProductionSubmissions;
export async function submitAssignmentUseCase(data: AssignmentSubmitForm) {
    // data.
    await submitAssignmentDta(data);
}
export async function deleteAssignmentUseCase(id) {
    await deleteAssignmentDta(id);
}
export async function deleteAssignmentSubmissionUseCase(id) {
    await deleteAssignmentSubmissionDta(id);
}
