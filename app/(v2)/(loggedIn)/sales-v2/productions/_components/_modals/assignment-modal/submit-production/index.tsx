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
import ControlledSelect from "@/components/common/controls/controlled-select";
import { cn } from "@/lib/utils";
import { _submitProduction } from "../_action/actions";
import { toast } from "sonner";

interface Props {
    salesDoor: OrderAssignmentSalesDoor;
    assignment: OrderAssignmentSalesDoor["assignments"][0];
    isGarage: boolean;
}
export default function SubmitDoorProduction({
    salesDoor,
    assignment,
    isGarage,
}: Props) {
    const data = useAssignmentData();
    const modal = useAssignment({ prod: data.data.isProd });

    const [open, onOpenChange] = useState(false);
    const form = useForm<Partial<OrderProductionSubmissions>>({
        defaultValues: {
            assignmentId: assignment.id,
            salesOrderId: assignment.orderId,
            salesOrderItemId: assignment.itemId,
            note: "",
            lhQty: 0,
            rhQty: 0,
            // leftHandle: false,
        },
    });
    // assignment.pending
    const [inputs, setInputs] = useState<
        {
            label?;
            key?;
            options?: string[];
        }[]
    >([]);
    useEffect(() => {
        if (open) {
            let opt = assignment.pending;
            function _input(k) {
                const v = opt[k?.toLowerCase()];
                let label = k;
                if (isGarage && k == "LH") label = "Qty";
                // if(isGarage)
                return {
                    label,
                    key: `${k?.toLowerCase()}Qty`,
                    options: Array(v || 0)
                        .fill(0)
                        .map((s, i) => (i + 1).toString()),
                };
            }
            const _inputs = [_input("LH"), _input("RH")];
            // console.log(_inputs);

            setInputs(_inputs);
        }
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
    const [saving, startSaving] = useTransition();
    async function submit() {
        startSaving(async () => {
            const _data = form.getValues();
            _data.lhQty = Number(_data.lhQty) || null;
            _data.rhQty = Number(_data.rhQty) || null;
            // console.log(data);
            await _submitProduction(_data);
            onOpenChange(false);
            toast.success("Submitted successfully");
            modal.open(data.data.id);
        });
    }

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

                    disabled={assignment.qtyCompleted == assignment.qtyAssigned}
                    size={"sm"}
                    variant={"outline"}
                    className="p-2 h-6"
                >
                    Submit
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" className="mx-4">
                <Form {...form}>
                    <Card className="w-[500px] border-transparent">
                        <CardHeader>
                            <CardTitle>Submit Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {inputs.map((i) => (
                                    <div key={i.label} className={cn("")}>
                                        <ControlledSelect
                                            className={cn(
                                                !i.options?.length && "hidden"
                                            )}
                                            disabled={i.options?.length == 0}
                                            key={i.label}
                                            control={form.control}
                                            name={i.key}
                                            options={i.options}
                                            label={i.label}
                                        />
                                    </div>
                                ))}

                                <ControlledInput
                                    className="col-span-2"
                                    type="textarea"
                                    label="Note"
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
