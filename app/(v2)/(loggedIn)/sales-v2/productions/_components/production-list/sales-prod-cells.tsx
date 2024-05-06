"use client";
import { TableCol } from "@/components/common/data-table/table-cells";
import { ProductionListItemType } from ".";
import { Badge } from "@/components/ui/badge";

import { useAssignment } from "../_modals/assignment-modal/use-assignment";

interface Props {
    item: ProductionListItemType;
}
function Order({ item }: Props) {
    return (
        <TableCol href={`/sales-v2/production/${item.slug}`}>
            <TableCol.Primary>
                {item.customer?.businessName || item.customer?.name}
            </TableCol.Primary>
            <TableCol.Secondary>{item.orderId}</TableCol.Secondary>
        </TableCol>
    );
}
function SalesRep({ item }: Props) {
    return (
        <TableCol>
            <TableCol.Secondary>{item.salesRep?.name}</TableCol.Secondary>
        </TableCol>
    );
}
function Status({ item }: Props) {
    let status = "Not Assigned";

    return (
        <>
            <TableCol.Status status={status} />
        </>
    );
}
function ProductionStatus({ item }: Props) {
    return (
        <>
            <TableCol.Status status={item.productionStatus?.status} />
        </>
    );
}
function AssignedTo({ item }: Props) {
    const assignedTo = item.assignments?.filter(
        (a, i) =>
            i ==
            item.assignments.findIndex((b) => b.assignedToId == a.assignedToId)
    );
    const assignment = useAssignment();
    return (
        <TableCol
            onClick={(e) => {
                assignment.open(item.id);
            }}
        >
            <TableCol.Secondary className="hover:cursor-pointer">
                {assignedTo.length ? (
                    <div className="flex space-x-2">
                        {assignedTo
                            ?.filter((_, i) => i < 2)
                            .map((user) => (
                                <Badge>{user.assignedTo.name}</Badge>
                            ))}
                    </div>
                ) : (
                    <TableCol.Status status="Not Assigned" />
                )}
            </TableCol.Secondary>
        </TableCol>
    );
}
function Actions({ item }: Props) {
    return <></>;
}

export let ProductionCells = {
    Order,
    SalesRep,
    Status,
    ProductionStatus,
    AssignedTo,
    Actions,
};
// export let ProductionCells = Object.assign(Base, {
//     Order,
//     Actions,
//     SalesRep,
//     Status,
//     AssignedTo,
//     ProductionStatus,
// });
