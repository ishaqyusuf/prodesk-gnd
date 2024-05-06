"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderAssignmentData, useAssignmentData } from "..";
import { startTransition, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TableCol } from "@/components/common/data-table/table-cells";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import Btn from "@/components/_v1/btn";
import { useStaticProducers } from "@/_v2/hooks/use-static-data";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { cn } from "@/lib/utils";
import { useValidateAssignment } from "./validate-assignment";
import { createProdAssignment } from "../_action/create-assignment";
import { toast } from "sonner";
import { useAssignment } from "../use-assignment";

export interface IAssignGroupForm {
    assignToId?: number;
    doors: {
        [id in string]: OrderAssignmentData["doorGroups"][0]["salesDoors"][0]["report"];
    };
}
export default function AssignGroup({ index }) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(false);
    const form = useForm<IAssignGroupForm>({
        defaultValues: {
            doors: {},
            assignToId: -1,
        },
    });
    const validator = useValidateAssignment(form);

    useEffect(() => {
        if (open) {
            const doors: any = {};
            group?.salesDoors?.map((s) => {
                doors[s.salesDoor?.id] = {
                    // qty: s.report.pendingAssignment,
                    ...s.report,
                };
            });
            console.log(doors);
            form.reset({
                doors,
                assignToId: -1,
            });
        }
    }, [open]);
    const prodUsers = useStaticProducers();
    const [saving, startSaving] = useTransition();
    if (!group) return null;
    let hands = [
        {
            qty: "lhQty",
            pending: "lhPending",
            title: !group.isType.garage ? "LH" : "Qty",
        },
        !group.isType.garage && {
            qty: "rhQty",
            pending: "rhPending",
            title: "RH",
        },
    ].filter((s) => s) as any;
    const modal = useAssignment();
    async function assign() {
        startSaving(async () => {
            try {
                const _data = validator.validate();
                if (_data) {
                    const r = await createProdAssignment(_data);
                    toast.success("Production assigned");
                    modal.open(data.data.id);
                    onOpenChange(false);
                }
            } catch (error) {
                console.log(error);
            }
        });
    }
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger
                asChild
                disabled={group.report.pendingAssignment == 0}
            >
                <Button
                    onClick={() => onOpenChange(!open)}
                    disabled={group.report.pendingAssignment == 0}
                    size={"sm"}
                >
                    Assign ({group.report.pendingAssignment})
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mx-4">
                <Form {...form}>
                    <Card className="w-[500px] border-transparent">
                        <CardHeader>
                            <CardTitle>Assign</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="">
                                <ControlledSelect
                                    control={form.control}
                                    options={prodUsers.data}
                                    titleKey={"name"}
                                    valueKey="id"
                                    name="assignToId"
                                    label={"Assign To"}
                                />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableHead>Door</TableHead>
                                    {hands?.map((h) => (
                                        <TableHead key={h.title}>
                                            {h.title}
                                        </TableHead>
                                    ))}
                                    {/* {group.isType.garage ? (
                                        <TableHead>Qty</TableHead>
                                    ) : (
                                        <>
                                            <TableHead>LH</TableHead>
                                            <TableHead>RH</TableHead>
                                        </>
                                    )} */}
                                </TableHeader>
                                <TableBody>
                                    {group.salesDoors
                                        ?.filter(
                                            (s) => s.report?.pendingAssignment
                                        )
                                        .map((salesDoor) => (
                                            <TableRow
                                                className=""
                                                key={salesDoor.salesDoor.id}
                                            >
                                                <TableCell>
                                                    <TableCol.Primary>
                                                        {salesDoor.doorTitle}
                                                    </TableCol.Primary>
                                                    <TableCol.Secondary>
                                                        {
                                                            salesDoor.salesDoor
                                                                .dimension
                                                        }
                                                    </TableCol.Secondary>
                                                </TableCell>

                                                {hands.map((h) => (
                                                    <TableCell key={h.title}>
                                                        <div className="flex space-x-2 items-center">
                                                            <ControlledInput
                                                                disabled={
                                                                    salesDoor
                                                                        .report?.[
                                                                        h
                                                                            .pending
                                                                    ] == 0
                                                                }
                                                                control={
                                                                    form.control
                                                                }
                                                                className="w-[80px]"
                                                                name={
                                                                    `doors.${salesDoor.salesDoor.id}._assignForm.${h.qty}` as any
                                                                }
                                                                type="number"
                                                            />
                                                            <span
                                                                className={cn(
                                                                    "whitespace-nowrap",
                                                                    salesDoor
                                                                        .report?.[
                                                                        h
                                                                            .pending
                                                                    ] == 0 &&
                                                                        "text-muted-foreground cursor-not-allowed"
                                                                )}
                                                            >
                                                                /{" "}
                                                                {
                                                                    salesDoor
                                                                        .report?.[
                                                                        h
                                                                            .pending
                                                                    ]
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <div className="flex w-full justify-end">
                                <Btn isLoading={saving} onClick={assign}>
                                    Assign
                                </Btn>
                            </div>
                        </CardFooter>
                    </Card>
                </Form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
