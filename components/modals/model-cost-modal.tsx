"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import Btn from "../btn";
import BaseModal from "./base-modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ICostChart, IHomeTemplate } from "@/types/community";
import { ScrollArea } from "../ui/scroll-area";
import { DatePicker } from "../date-range-picker";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { saveModelCost } from "@/app/_actions/community/model-costs";
import { deepCopy } from "@/lib/deep-copy";
import { sum } from "@/lib/utils";
import { calculateCommunitModelCost } from "@/lib/community/community-utils";
import { _saveCommunitModelCostData } from "@/app/_actions/community/community-model-cost";

export default function ModelCostModal({ community }: { community?: Boolean }) {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<{ costs: ICostChart[] }>({
        defaultValues: {}
    });
    const { append, prepend, fields, replace } = useFieldArray({
        control: form.control,
        name: "costs"
    });
    const [titleList, setTitleList] = useState<string[]>([]);
    useEffect(() => {
        setTitleList(fields.map(f => f.title));
    }, fields);
    const [index, setIndex] = useState(0);
    async function submit(data) {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                // const isValid = emailSchema.parse(form.getValues());
                const costs = deepCopy<ICostChart[]>(form.getValues(`costs`));
                let cost = costs[index];
                if (!cost) return;
                // console.log(cost);
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
                if (community) {
                    console.log(data.project?.builder?.meta?.tasks);
                    cost.meta = calculateCommunitModelCost(
                        cost.meta,
                        data.project?.builder?.meta?.tasks
                    );
                    console.log(cost.meta);
                    // return;
                    cost.model = data.modelName;
                    const c = await _saveCommunitModelCostData(
                        cost as any,
                        data.id
                    );
                    form.setValue(`costs.${index}` as any, c as any);
                } else {
                    cost.meta.totalCost = sum(Object.values(cost.meta.costs));
                    console.log(cost.meta.totalCost);
                    cost.model = data.modelNo as any;
                    // console.log([data.id, cost.id, index]);
                    const c = await saveModelCost(cost, data.id);
                    form.setValue(`costs.${index}` as any, c as any);
                    route.refresh();
                }

                // console.log(JSON.stringify(cost));

                //    form.setValue
                // closeModal();
                toast.success("Saved!");
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    async function init(data: IHomeTemplate) {
        let costs = deepCopy<ICostChart[]>(data.costs ?? [])?.map(c => {
            if (c.startDate) c.startDate = new Date(c.startDate);
            if (c.endDate) c.endDate = new Date(c.endDate);
            return c;
        });
        if (!costs.length)
            costs = [
                {
                    meta: {}
                }
            ] as any;
        // console.log(costs);
        // replace(deepCopy(costs));
        form.reset({
            costs: [
                ...costs.filter(entry => entry.endDate === null),
                ...costs
                    .filter(entry => entry.endDate !== null)
                    .sort((a, b) => Number(b.startDate) - Number(a.startDate))
            ]
        });
        setIndex(0);
    }
    async function changeIndex(to) {
        setIndex(-1);
        // await timeout(500);
        setIndex(to);
    }
    return (
        <BaseModal<any>
            className="sm:max-w-[700px]"
            onOpen={data => {
                init(data);
            }}
            onClose={() => {}}
            modalName="modelCost"
            Title={({ data }) => <div>Model Cost ({data?.modelName})</div>}
            Subtitle={({ data }) => <>{data?.project?.title}</>}
            Content={({ data }) => (
                <div className="flex w-full divide-x">
                    <div className="sm:w-1/3 space-y-2 pr-2">
                        <div className="">
                            <Label>Cost History</Label>
                        </div>
                        <div className="">
                            <Button
                                disabled={fields.some(f => !f.createdAt)}
                                onClick={() => {
                                    if (fields?.some(c => !c.createdAt)) {
                                        toast.error("You have unsaved costs");
                                    } else
                                        prepend({
                                            type: "task-costs",
                                            model: data?.modelName
                                        } as any);
                                    changeIndex(0);
                                }}
                                variant="outline"
                                className="w-full h-7 mt-1"
                            >
                                <Plus className="mr-2 w-4 h-4" />
                                <span>New Cost</span>
                            </Button>
                        </div>
                        <ScrollArea className="max-h-[350px] w-full">
                            <div className="divide-y">
                                {/* {changing ? "CHANGING" : "CHANGE COMPLETE"} */}
                                {fields.map((f, i) => (
                                    <Button
                                        variant={
                                            i == index ? "secondary" : "ghost"
                                        }
                                        className="text-sm cursor-pointer hover:bg-slate-200 h-8 text-start tex-sm p-0.5 w-full"
                                        key={i}
                                        onClick={() => {
                                            changeIndex(i);
                                        }}
                                    >
                                        <div>{f.title || "New Cost"}</div>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="grid flex-1 grid-cols-4  pl-2 gap-2">
                        {fields.map(
                            (field, fIndex) =>
                                fIndex == index && (
                                    <>
                                        <div className="col-span-2 grid gap-2">
                                            <Label>From</Label>
                                            <DatePicker
                                                className="w-auto h-8"
                                                setValue={e =>
                                                    form.setValue(
                                                        `costs.${fIndex}.startDate`,
                                                        e
                                                    )
                                                }
                                                value={form.getValues(
                                                    `costs.${fIndex}.startDate`
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2 grid gap-2">
                                            <Label>To</Label>
                                            <DatePicker
                                                className="w-auto h-8"
                                                setValue={e =>
                                                    form.setValue(
                                                        `costs.${fIndex}.endDate`,
                                                        e
                                                    )
                                                }
                                                value={form.getValues(
                                                    `costs.${fIndex}.endDate`
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-4 grid-cols-4 grid bg-slate-100 py-2">
                                            <Label className="col-span-2 mx-2">
                                                Tasks
                                            </Label>
                                            <Label className="col-span-1">
                                                Cost ($)
                                            </Label>
                                            <Label className="col-span-1">
                                                Tax ($)
                                            </Label>
                                        </div>
                                        {(community
                                            ? data?.project?.builder
                                            : data?.builder
                                        )?.meta?.tasks?.map((t, _i) => (
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
                                                            `costs.${fIndex}.meta.costs.${t.uid}`
                                                        )}
                                                        // onChange={e =>
                                                        //     form.setValue(
                                                        //         `costs.${fIndex}.meta.costs.${t.uid}`,
                                                        //         e.target
                                                        //             .value as any
                                                        //     )
                                                        // }
                                                        // value={form.getValues(
                                                        //     `costs.${fIndex}.meta.costs.${t.uid}`
                                                        // )}
                                                    />
                                                </div>
                                                <div className="">
                                                    <Input
                                                        type="number"
                                                        className="h-8"
                                                        // {...form.register(
                                                        //     `costs.${fIndex}.meta.tax.${t.uid}`
                                                        // )}
                                                        {...form.register(
                                                            `costs.${fIndex}.meta.tax.${t.uid}`
                                                        )}
                                                        // onChange={e =>
                                                        //     form.setValue(
                                                        //         `costs.${fIndex}.meta.tax.${t.uid}`,
                                                        //         e.target
                                                        //             .value as any
                                                        //     )
                                                        // }
                                                        // value={form.getValues(
                                                        //     `costs.${fIndex}.meta.tax.${t.uid}`
                                                        // )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="col-span-4 flex justify-end">
                                            <Btn
                                                className="h-8"
                                                isLoading={isSaving}
                                                onClick={() =>
                                                    submit(data as any)
                                                }
                                                size="sm"
                                                type="submit"
                                            >
                                                Save
                                            </Btn>
                                        </div>
                                    </>
                                )
                        )}
                    </div>
                </div>
            )}
        />
    );
}
