import { sum } from "@/lib/utils";
import {
    Assignments,
    LineAssignment,
    LineItemOverview,
} from "./sales-item-dto";

export function salesItemAssignmentsDto(
    data: LineItemOverview,
    _assignments: Assignments
) {
    const assignments: LineAssignment[] = [];

    _assignments.map((d, i) => {
        function __sum(k: "lhQty" | "rhQty" | "qty", data) {
            return sum(data.map((s) => s?.[k]));
        }
        const deliveries = d.submissions.map((s) => s.itemDeliveries).flat();

        const _data: LineAssignment = {
            assignedTo: d.assignedTo.name,
            id: d.id,
            assignedToId: d.assignedToId,
            dueDate: d.dueDate,
            submissions: d.submissions.map((sb) => ({
                id: sb.id,
                date: sb.createdAt,
                qty: __qty(sb.lhQty, sb.rhQty, sb.qty),
            })),
            deliveries: deliveries.map((del) => ({
                date: del.createdAt,
                deliveryId: del.orderDeliveryId,
                id: del.id,
                qty: __qty(del.lhQty, del.rhQty, del.qty),
            })),
            submitted: __qty(
                __sum("lhQty", d.submissions),
                __sum("rhQty", d.submissions),
                __sum("qty", d.submissions)
            ),
            delivered: __qty(
                __sum("lhQty", deliveries),
                __sum("rhQty", deliveries),
                __sum("qty", deliveries)
            ),
            qty: __qty(d.lhQty, d.rhQty, d.qtyAssigned),
            pendingQty: 0,
        };
        _data.pendingQty = _data.qty.total - _data.submitted.total;
        assignments.push(_data);
    });
    return assignments;
}
function __qty(lhQty, rhQty, total) {
    return {
        lhQty,
        rhQty,
        total,
    };
}
