import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAssignmentData } from ".";

import { useState } from "react";
import { TableCol } from "@/components/common/data-table/table-cells";
import { Info } from "@/components/_v1/info";

import { AssignGroup } from "./assign-group";
import DoorAssignments from "./door-assignments";

export default function DoorGroupSection({ index }) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(true);
    if (!group) return null;

    return (
        <Collapsible className="mt-4" open={open}>
            <CollapsibleTrigger asChild>
                <div className="p-2 rounded  bg-black-300/5  border  w-full flex">
                    <button
                        onClick={() => onOpenChange(!open)}
                        className="uppercase flex-1 font-semibold text-start"
                    >
                        {group.sectionTitle}
                    </button>
                    <div>
                        <AssignGroup index={index} />
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                {group.salesDoors.map((sd, i) => (
                    <div className="text-sm p-2 border-b" key={i}>
                        <div className="">
                            <TableCol.Primary>{sd?.doorTitle}</TableCol.Primary>
                            <TableCol.Secondary>
                                {sd.salesDoor.dimension}
                            </TableCol.Secondary>
                        </div>
                        <div className="grid gap-4 p-2 grid-cols-3 sm:grid-cols-5">
                            {group.doorConfig.singleHandle ? (
                                <Info label="Qty" value={sd.report.totalQty} />
                            ) : (
                                <>
                                    <Info label="LH" value={sd.report.lhQty} />
                                    <Info label="RH" value={sd.report.rhQty} />
                                </>
                            )}
                            <Info
                                label="Assigned"
                                value={`${sd.report.assigned} of ${sd.report.totalQty}`}
                            />
                            <Info
                                label="Completed"
                                value={sd.report.completed}
                            />
                        </div>
                        <DoorAssignments groupIndex={index} doorIndex={i} />
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
