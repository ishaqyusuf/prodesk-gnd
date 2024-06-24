"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderAssignmentData, useAssignmentData } from "..";
import { useEffect, useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/_v1/date-range-picker";
import dayjs from "dayjs";
import { serverDate } from "../_action/actions";

export interface IAssignGroupForm {
    assignToId?: number;
    prodDueDate;

    doors: {
        [id in string]: OrderAssignmentData["doorGroups"][0]["salesDoors"][0]["report"];
    };
}
interface Props {
    index;
    salesDoorIndex?;
}
export function AssignGroup({ index, salesDoorIndex = -1 }: Props) {
    const data = useAssignmentData();
    const modal = useAssignment(
        data.data.isProd ? { type: "prod" } : undefined
    );
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(false);
    const form = useForm<IAssignGroupForm>({
        defaultValues: {
            doors: {},
            assignToId: -1,
        },
    });
    // console.log(group.sal);
    const prodDueDate = form.watch("prodDueDate");
    const validator = useValidateAssignment(form);
    // async function ÷

    useEffect(() => {
        if (open) {
            const doors: any = {};
            group?.salesDoors?.map((s, si) => {
                if (
                    (salesDoorIndex >= 0 && si == salesDoorIndex) ||
                    salesDoorIndex < 0
                ) {
                    console.log(
                        [salesDoorIndex, s.salesDoor.salesOrderItemId],
                        si
                    );

                    // console.log(s.salesDoor?.id?.toString());

                    doors[s.salesDoor?.id?.toString()] = {
                        // qty: s.report.pendingAssignment,
                        ...s.report,
                        lhQty: s.report._unassigned?.lh,
                        rhQty: s.report._unassigned?.rh,
                    };
                }
            });
            form.reset({
                doors,
                assignToId: -1,
            });
        }
    }, [open]);
    const prodUsers = useStaticProducers();
    const [saving, startSaving] = useTransition();
    if (!group || data.data.isProd) return null;

    let hands = [
        {
            qty: "lhQty",
            pending: "lhPending",
            title: !group.doorConfig.singleHandle ? "LH" : "Qty",
            handle: "lh",
        },
        !group.doorConfig.singleHandle && {
            qty: "rhQty",
            pending: "rhPending",
            title: group.doorConfig.singleHandle ? "" : "RH",
            handle: "rh",
        },
    ].filter((s) => s) as any;

    async function assign() {
        startSaving(async () => {
            try {
                const _data = validator.validate();
                let dueDate = form.getValues("prodDueDate");
                if (_data) {
                    const r = await createProdAssignment(
                        _data,
                        data.data.productionStatus?.id,
                        data.data.totalQty,
                        dueDate
                    );
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
                disabled={
                    salesDoorIndex >= 0
                        ? group.salesDoors[salesDoorIndex]?.report
                              ?.pendingAssignment == 0
                        : group.report.pendingAssignment == 0
                }
            >
                {!data.data.readOnly && (
                    <Button
                        onClick={() => onOpenChange(!open)}
                        disabled={
                            salesDoorIndex >= 0
                                ? group.salesDoors[salesDoorIndex]?.report
                                      ?.pendingAssignment == 0
                                : group.report.pendingAssignment == 0
                        }
                        size={"sm"}
                        className="whitespace-nowrap p-2 h-8"
                    >
                        Assign (
                        {salesDoorIndex >= 0
                            ? group.salesDoors[salesDoorIndex]?.report
                                  ?.pendingAssignment
                            : group.report.pendingAssignment}
                        )
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" className="mx-4">
                <Form {...form}>
                    <Card className="w-[500px] border-transparent">
                        <CardHeader>
                            <CardTitle>Assign to Production</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[50vh] overflow-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <ControlledSelect
                                    control={form.control}
                                    options={prodUsers.data}
                                    titleKey={"name"}
                                    valueKey="id"
                                    name="assignToId"
                                    label={"Assign To"}
                                />
                                <div className="grid gap-4">
                                    <Label>Due Date</Label>
                                    <DatePicker
                                        className="w-auto h-7s"
                                        value={prodDueDate}
                                        setValue={(v) => {
                                            form.setValue("prodDueDate", v);
                                        }}
                                    />
                                </div>
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
                                                                        .report
                                                                        ._unassigned[
                                                                        h.handle
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
                                                                        .report
                                                                        ._unassigned[
                                                                        h.handle
                                                                    ] == 0 &&
                                                                        "text-muted-foreground cursor-not-allowed"
                                                                )}
                                                            >
                                                                /{" "}
                                                                {
                                                                    salesDoor
                                                                        .report
                                                                        ._unassigned[
                                                                        h.handle
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
                        <CardFooter className="">
                            <div className="flex w-full justify-end">
                                <Btn
                                    size="sm"
                                    isLoading={saving}
                                    onClick={assign}
                                >
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
