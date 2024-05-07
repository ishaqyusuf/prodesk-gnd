"use client";
import { TableCol } from "@/components/common/data-table/table-cells";
import { ProductionListItemType } from ".";
import { Badge } from "@/components/ui/badge";

import { useAssignment } from "../_modals/assignment-modal/use-assignment";
import { sum } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
    item: ProductionListItemType;
}
function Order({ item }: Props) {
    return (
        <TableCol>
            {/* //shref={`/sales-v2/production/${item.slug}`}> */}
            <TableCol.Primary className="line-clamp-1">
                {item.customer?.businessName || item.customer?.name}
            </TableCol.Primary>
            <TableCol.Secondary className="line-clamp-1">
                {item.orderId}
            </TableCol.Secondary>
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
    let color = "red";
    let total = sum(item.doors.map((d) => sum([d.lhQty, d.rhQty])));
    let assigned = sum(item.assignments.map((a) => a.qtyAssigned));

    if (assigned) {
        status =
            // assigned == total ? "Assigned" :
            `${assigned} of ${total} assigned`;
        color = assigned == total ? "green" : "yellow";
    }

    // if(item.assignments.length)
    return (
        <>
            <TableCol.Status color={color} status={status} />
        </>
    );
}
function ProductionStatus({ item }: Props) {
    const submitted = sum(
        item.assignments.map((a) =>
            sum(a.submissions.map((s) => sum([s.lhQty, s.rhQty])))
        )
    );
    const totalDoors = sum(item.doors.map((d) => sum([d.rhQty, d.lhQty])));
    // console.log({ totalDoors, submitted });

    return (
        <>
            <TableCol.Status
                score={submitted}
                total={totalDoors}
                status={item.productionStatus?.status}
            />
        </>
    );
}
function AssignedTo({ item }: Props) {
    const assignment = useAssignment();
    const assignedTo = item.assignments?.filter(
        (a, i) =>
            i ==
            item.assignments.findIndex((b) => b.assignedToId == a.assignedToId)
    );
    return (
        <TableCol
            onClick={(e) => {
                assignment.open(item.id);
            }}
        >
            <TableCol.Secondary className="hover:cursor-pointer">
                {assignedTo.length ? (
                    <div className="flex space-x-2 items-center flex-wrap gap-1">
                        {assignedTo
                            ?.filter((_, i) => i < 2)
                            .map((user) => (
                                <Badge
                                    variant={"outline"}
                                    className="h-auto"
                                    key={user.id}
                                >
                                    <span className="line-clamp-2 whitespace-nowrap max-w-[80px]">
                                        {user.assignedTo.name}
                                    </span>
                                </Badge>
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
function ProdActions({ item }: Props) {
    const assignment = useAssignment({ prod: true });
    return (
        <>
            <Button
                onClick={() => assignment.open(item.id)}
                variant={"outline"}
            >
                View
            </Button>
        </>
    );
}
export let ProductionCells = {
    Order,
    SalesRep,
    Status,
    ProductionStatus,
    AssignedTo,
    ProdActions,
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
