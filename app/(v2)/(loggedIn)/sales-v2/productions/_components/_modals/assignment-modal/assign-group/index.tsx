"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignmentData } from "..";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                doors[s.salesDoor?.id?.toString()] = {
                    qty: s.report.pendingAssignment,
                };
            });
            console.log(doors);
            form.reset({
                doors,
            });
        }
    }, [open]);
    if (!group) return null;

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
                                                        name={`doors.${salesDoor.salesDoor.id}`}
                                                        type="number"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
