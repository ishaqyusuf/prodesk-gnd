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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import DoorSubmissions from "./door-submissions";

export default function DoorGroupSection({ index }) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(true);
    if (!group) return null;
    return (
        <Collapsible className="mt-4" open={open}>
            <CollapsibleTrigger
                className={cn(!group.isDyke && !group.sectionTitle && "hidden")}
                asChild
            >
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
                        <div className="flex gap-4">
                            <div className="">
                                <TableCol.Primary>
                                    {sd?.doorTitle}
                                </TableCol.Primary>
                                <TableCol.Secondary>
                                    {sd.salesDoor.dimension}
                                </TableCol.Secondary>
                            </div>
                            <div
                                className={cn(
                                    !group.isDyke && !group.sectionTitle
                                        ? ""
                                        : "hidden"
                                )}
                            >
                                <AssignGroup index={index} />
                            </div>
                        </div>
                        <div className="grid gap-4 p-2 grid-cols-3 sm:grid-cols-5">
                            {group.doorConfig.singleHandle || !group.isDyke ? (
                                <Info label="Qty" value={sd.report.totalQty} />
                            ) : (
                                <>
                                    <Info label="LH" value={sd.report.lhQty} />
                                    <Info label="RH" value={sd.report.rhQty} />
                                </>
                            )}
                            {group.doorConfig.doorType == "Garage" && (
                                <Info
                                    label="Swing"
                                    value={`${sd.salesDoor.swing}`}
                                />
                            )}
                            {!group.isDyke && (
                                <Info label="Handle" value={group.item.swing} />
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
                        <DetailsBlock group={group}>
                            {group.doorDetails
                                .filter((d) => d.value)
                                .map((detail) => (
                                    <div
                                        key={detail.title}
                                        className="grid grid-cols-5 border-b border-r  gap-2"
                                    >
                                        <div className="font-bold col-span-2  border-r px-2 py-1">
                                            {detail.title}
                                        </div>
                                        <div className=" col-span-3 px-2 py-1">
                                            {detail.value}
                                        </div>
                                    </div>
                                ))}
                        </DetailsBlock>

                        {/* {group.doorDetails} */}
                        <DoorAssignments groupIndex={index} doorIndex={i} />
                        <DoorSubmissions groupIndex={index} doorIndex={i} />
                    </div>
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
function DetailsBlock({ children, group }) {
    const [showDetails, setShowDetails] = useState(false);
    return (
        <div
            className={cn(
                "p-1",
                showDetails && "border",
                (!group.isDyke || group.isType.service) && "hidden"
            )}
        >
            <Button
                onClick={() => {
                    setShowDetails(!showDetails);
                }}
                variant={showDetails ? "ghost" : "secondary"}
                size={"sm"}
                className="flex w-full justify-center h-8"
            >
                <span>{!showDetails ? "Show Details" : "Hide Details"}</span>
                {!showDetails ? (
                    <Icons.chevronDown className="w-4 h-4" />
                ) : (
                    <Icons.chevronUp className="w-4 h-4" />
                )}
            </Button>
            <div
                className={cn(showDetails ? "grid" : "hidden", " grid-cols-2")}
            >
                {children}
            </div>
        </div>
    );
}
