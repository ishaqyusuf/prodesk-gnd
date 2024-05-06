"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderAssignmentSalesDoor, useAssignmentData } from "..";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import Btn from "@/components/_v1/btn";
import { useStaticProducers } from "@/_v2/hooks/use-static-data";

import { useValidateAssignment } from "./validate-assignment";

import { useAssignment } from "../use-assignment";
import { OrderProductionSubmissions } from "@prisma/client";
import ControlledInput from "@/components/common/controls/controlled-input";

interface Props {
    salesDoor: OrderAssignmentSalesDoor;
    assignment: OrderAssignmentSalesDoor["assignments"][0];
}
export default function SubmitDoorProduction({ salesDoor, assignment }: Props) {
    const data = useAssignmentData();
    const modal = useAssignment();

    const [open, onOpenChange] = useState(false);
    const form = useForm<Partial<OrderProductionSubmissions>>({
        defaultValues: {
            assignmentId: assignment.id,
            salesOrderId: assignment.orderId,
            salesOrderItemId: assignment.itemId,
            note: "",
            // leftHandle: false,
        },
    });
    const validator = useValidateAssignment(form);

    useEffect(() => {
        // if (open) {
        //     const doors: any = {};
        //     group?.salesDoors?.map((s) => {
        //         doors[s.salesDoor?.id] = {
        //             // qty: s.report.pendingAssignment,
        //             ...s.report,
        //         };
        //     });
        //     console.log(doors);
        //     form.reset({
        //         doors,
        //         assignToId: -1,
        //     });
        // }
    }, [open]);
    const prodUsers = useStaticProducers();
    const [saving, startSaving] = useTransition();
    async function submit() {}

    function toggleSubmitProduction() {
        onOpenChange(!open);
    }
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger
                asChild
                // disabled={group.report.pendingAssignment == 0}
            >
                <Button
                    onClick={toggleSubmitProduction}
                    // disabled={group.report.pendingAssignment == 0}
                    size={"sm"}
                    variant={"outline"}
                    className="p-2 h-6"
                >
                    Submit
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mx-4">
                <Form {...form}>
                    <Card className="w-[500px] border-transparent">
                        <CardHeader>
                            <CardTitle>Submit Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {assignment.pending.rh ? (
                                        <ControlledInput type="number" />
                                    ) : (
                                        <></>
                                    )}
                                </div>
                                <ControlledInput
                                    className="col-span-2"
                                    type="text"
                                    control={form.control}
                                    name="note"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex w-full justify-end">
                                <Btn isLoading={saving} onClick={submit}>
                                    Submit
                                </Btn>
                            </div>
                        </CardFooter>
                    </Card>
                </Form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
