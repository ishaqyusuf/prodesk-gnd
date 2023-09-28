"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ICostChart, IHomeTemplate } from "@/types/community";
import { ScrollArea } from "../ui/scroll-area";
import { PrimaryCellContent } from "../columns/base-columns";
import { DatePicker } from "../date-range-picker";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { saveModelCost } from "@/app/_actions/community/model-costs";
import { deepCopy } from "@/lib/deep-copy";
import dayjs from "dayjs";
import { sum } from "@/lib/utils";

export default function ModelCostModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<{ costs: ICostChart[] }>({
        defaultValues: {}
    });
    const { append, fields } = useFieldArray({
        control: form.control,
        name: "costs"
    });
    const [index, setIndex] = useState(0);
    async function submit(data: IHomeTemplate) {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                // const isValid = emailSchema.parse(form.getValues());
                const costs = deepCopy<ICostChart[]>(form.getValues(`costs`));
                const cost = costs[index];
                if (!cost) return;
                if (!cost.startDate) {
                    toast.error("Add a valid starting date");
                    return;
                }
                if (!cost.endDate) {
                    const cIndex = costs.findIndex(c => c.id && !c.endDate);
                    if (cIndex > -1 && cIndex != index) {
                        toast.error("Only one cost can have empty end date");
                        return;
                    }
                }
                // console.log(JSON.stringify(cost));
                cost.model = data.modelNo as any;
                cost.meta.totalCost = sum(Object.values(cost.meta.costs));
                console.log(cost.meta.totalCost);
                if (!cost) {
                    return;
                }
                console.log([data.id, cost.id, index]);
                const c = await saveModelCost(cost, data.id);
                console.log(c);
                form.setValue(`tasks.${index}` as any, c as any);
                //    form.setValue
                // closeModal();
                toast.message("Saved!");
                route.refresh();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    async function init(data: IHomeTemplate) {
        form.reset({
            costs: data.costs?.map(c => {
                if (c.startDate) c.startDate = new Date(c.startDate);
                if (c.endDate) c.endDate = new Date(c.endDate);
                return c;
            }) || [
                {
                    meta: {}
                }
            ]
        });
    }
    return (
        <BaseModal<IHomeTemplate>
            className="sm:max-w-[700px]"
            onOpen={data => {
                init(data);
            }}
            onClose={() => {}}
            modalName="modelCost"
            Title={({ data }) => <div>Model Cost</div>}
            Content={({ data }) => (
                <div className="flex w-full divide-x">
                    <div className="sm:w-1/3 space-y-2 pr-2">
                        <div className="">
                            <Label>Cost History</Label>
                        </div>
                        <div className="">
                            <Button
                                disabled={fields.find(f => !f.id) != null}
                                onClick={() => {
                                    if (
                                        form
                                            .getValues("costs")
                                            ?.filter(c => !c.id)
                                    ) {
                                        toast.error("You have unsaved costs");
                                    } else
                                        append({
                                            type: "task-costs",
                                            model: data?.modelName
                                        } as any);
                                }}
                                variant="outline"
                                className="w-full h-7 mt-1"
                            >
                                <Plus className="mr-2 w-4 h-4" />
                                <span>New Cost</span>
                            </Button>
                        </div>
                        <ScrollArea className="max-h-[350px] divide-y w-full">
                            {fields.map((f, i) => (
                                <Button
                                    variant={i == index ? "secondary" : "ghost"}
                                    className="text-sm cursor-pointer hover:bg-slate-200 h-8 text-start tex-sm p-0.5 w-full"
                                    key={i}
                                    onClick={() => setIndex(i)}
                                >
                                    <div>{f.title}</div>
                                </Button>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="grid flex-1 grid-cols-4  pl-2 gap-2">
                        <div className="col-span-2 grid gap-2">
                            <Label>From</Label>
                            <DatePicker
                                className="w-auto h-8"
                                setValue={e =>
                                    form.setValue(`costs.${index}.startDate`, e)
                                }
                                value={form.getValues(
                                    `costs.${index}.startDate`
                                )}
                            />
                        </div>
                        <div className="col-span-2 grid gap-2">
                            <Label>To</Label>
                            <DatePicker
                                className="w-auto h-8"
                                setValue={e =>
                                    form.setValue(`costs.${index}.endDate`, e)
                                }
                                value={form.getValues(`costs.${index}.endDate`)}
                            />
                        </div>
                        <div className="col-span-4 grid-cols-4 grid bg-slate-100 py-2">
                            <Label className="col-span-2 mx-2">Tasks</Label>
                            <Label className="col-span-1">Cost ($)</Label>
                            <Label className="col-span-1">Tax ($)</Label>
                        </div>
                        {data?.builder?.meta?.tasks?.map((t, _i) => (
                            <div
                                key={_i}
                                className="col-span-4 gap-2 grid-cols-4 grid"
                            >
                                <div className="col-span-2">
                                    <Label>{t.name}</Label>
                                </div>
                                <div className="">
                                    <Input
                                        type="number"
                                        className="h-8"
                                        {...form.register(
                                            `costs.${index}.meta.costs.${t.uid}`
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Input
                                        type="number"
                                        className="h-8"
                                        {...form.register(
                                            `costs.${index}.meta.tax.${t.uid}`
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="col-span-4 flex justify-end">
                            <Btn
                                className="h-8"
                                isLoading={isSaving}
                                onClick={() => submit(data as any)}
                                size="sm"
                                type="submit"
                            >
                                Save
                            </Btn>
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
