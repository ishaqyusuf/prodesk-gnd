"use server";

import { createProdAssignment } from "../_components/_modals/assignment-modal/_action/create-assignment";
import { getOrderAssignmentData } from "../_components/_modals/assignment-modal/_action/get-order-assignment-data";
import { composeAssignments } from "../_components/_modals/assignment-modal/sectioned-item-assign-form/validate-assignment";

interface Props {
    orderId;
    index?;
    submitAction?: "only-assigned" | "all";
    userId?;
}
export async function markAsSubmittedAction(props: Props) {
    if (props.submitAction != "only-assigned") await assignAllAction(props);
    const order = await getOrderAssignmentData(props.orderId);
    await Promise.all(
        order.doorGroups.map(async (g) => {
            g.salesDoors.map((s) => {
                s.assignments.map((a) => {});
            });
        })
    );
}

export async function assignAllAction(props: Props) {
    const order = await getOrderAssignmentData(props.orderId);
    let assigned = 0;
    await Promise.all(
        order.doorGroups.map(async (group, _index) => {
            // if(index!! && index == _index)

            const form = group.assignmentForm;
            form.assignToId = props.userId;
            form.prodDueDate = new Date();
            const validate = composeAssignments(form);
            assigned += validate.assignments.length;
            if (validate.assignments.length)
                await createProdAssignment(
                    validate.assignments,
                    order.productionStatus,
                    order.totalQty,
                    form.prodDueDate
                );
        })
    );
    return { assigned };
}
