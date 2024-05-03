"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignmentData } from "..";
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

export default function AssignGroup({ index }) {
    const data = useAssignmentData();
    const group = data.data.doorGroups[index];
    const [open, onOpenChange] = useState(false);
    const form = useForm({
        defaultValues: {
            doors: {},
        },
    });
    useEffect(() => {
        if (open) {
            const doors: any = {};
            group?.salesDoors?.map((s) => {
                doors[s.salesDoor?.id] = {
                    qty: s.report.pendingAssignment,
                };
            });
            form.reset({
                doors,
            });
        }
    }, [open]);
    const [saving, startSaving] = useTransition();
    if (!group) return null;

    async function assign() {
        startSaving(async () => {
            const selections = form.getValues();
            Object.entries(selections).map(([id, d]) => {});
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
                            <Table>
                                <TableHeader>
                                    <TableHead>Door</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Assign</TableHead>
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
                                                <TableCell>
                                                    {
                                                        salesDoor.report
                                                            .pendingAssignment
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <ControlledInput
                                                        control={form.control}
                                                        name={
                                                            `doors.${salesDoor.salesDoor.id}.qty` as any
                                                        }
                                                        type="number"
                                                    />
                                                </TableCell>
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
