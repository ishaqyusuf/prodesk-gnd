"use server";

import { createProdAssignment } from "../_components/_modals/assignment-modal/_action/create-assignment";
import { getOrderAssignmentData } from "../_components/_modals/assignment-modal/_action/get-order-assignment-data";

export async function markAsSubmittedAction(id, userId) {
    await assignAllAction(id, userId);
    const order = await getOrderAssignmentData(id);
    // assign all pending assingments.
}
export async function assignAllAction(id, userId) {
    const order = await getOrderAssignmentData(id);
    await Promise.all(
        order.doorGroups.map(async (group) => {
            const form = group.assignmentForm;
            form.assignToId = userId;
            form.prodDueDate = new Date();
            await createProdAssignment(
                form.doors as any,
                order.productionStatus,
                order.totalQty,
                form.prodDueDate
            );
        })
    );
}
