"use client";

import { _getModelCostStat } from "@/app/_actions/community/_model-cost-stat";
import { deepCopy } from "@/lib/deep-copy";
import {
    ICommunityCosts,
    ICommunityTemplate,
    ICostChartMeta,
    IHome
} from "@/types/community";
import { useEffect, useState, useTransition } from "react";
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import BaseModal from "../base-modal";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ConfirmBtn from "@/components/confirm-btn";
import { cn } from "@/lib/utils";
import {
    _deleteCommunityModelCost,
    _saveCommunitModelCostData
} from "@/app/_actions/community/community-model-cost";
import { toast } from "sonner";
import { _getCommunityModelCostUnits } from "@/app/_actions/community/community-model-cost-units";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from "@/components/ui/form";
import ReRender from "@/components/re-render";
import { DatePicker } from "@/components/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import Btn from "@/components/btn";
import { calculateCommunitModelCost } from "@/lib/community/community-utils";
import Money from "@/components/money";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommunityModelCostModal() {
    const form = useForm<FormProps>({
        defaultValues: {
            index: 0,
            costs: [],
            stats: {}
        }
    });
    const watchIndex = form.watch("index");
    async function loadUnits(data: ICommunityTemplate) {
        form.setValue(
            "template",
            await _getCommunityModelCostUnits({
                pivotId: data.pivotId,
                communityId: data.id
            })
        );
    }
    async function onOpen(data: ICommunityTemplate) {
        const costs = deepCopy<ICommunityCosts[]>(
            data?.pivot?.modelCosts || [{ meta: {} }]
        ).map(c => {
            (c as any)._id = c.id;
            return c;
        });
        // setModelCosts(costs)
        const stats = await _getModelCostStat(costs as any, data.id);
        form.reset({
            index: 0,
            costs: costs as any,
            stats
        });
    }

    return (
        <BaseModal
            className="sm:max-w-[700px]"
            onOpen={onOpen}
            modalName="modelCost"
            Title={({ data }) => <div>Model Cost ({data?.modelName})</div>}
            Subtitle={({ data }) => <>{data?.project?.title}</>}
            Content={({ data }) => (
                <>
                    <div className="flex w-full divide-x -mb-10">
                        <CostHistory
                            watchIndex={watchIndex}
                            form={form}
                            data={data}
                        />

                        <CostForm
                            watchIndex={watchIndex}
                            form={form}
                            data={data}
                        />
                    </div>
                </>
            )}
        />
    );
}
interface Props {
    form: UseFormReturn<FormProps>;
    data;
    watchIndex;
}
interface FormProps {
    costs: (ICommunityCosts & { _id })[];
    index;
    stats: {
        [k in any]: number;
    };
    template?: ICommunityTemplate;
}
function CostHistory({ form, data, watchIndex }: Props) {
    const { prepend, remove, fields } = useFieldArray({
        control: form.control,
        name: "costs"
    });
    function createCost() {
        if (fields?.some(c => !c.createdAt)) {
            toast.error("You have unsaved costs");
        } else
            prepend({
                type: "task-costs",
                model: data?.modelName
            } as any);
        form.setValue("index", 0);
    }
    return (
        <div className="sm:w-2/5 space-y-2 pr-2">
            <div className="">
                <Label>Cost History</Label>
            </div>
            <div className="">
                <Button
                    onClick={createCost}
                    variant="outline"
                    className="w-full h-7 mt-1"
                >
                    <Plus className="mr-2 w-4 h-4" />
                    <span>New Cost</span>
                </Button>
            </div>
            <ScrollArea className="max-h-[350px] h-[350px] w-full">
                <div className="divide-y">
                    {fields.map((f, i) => (
                        <div
                            className="flex items-center space-x-2 group mr-2"
                            key={i}
                        >
                            <Button
                                variant={
                                    i == watchIndex ? "secondary" : "ghost"
                                }
                                className="text-sm cursor-pointer hover:bg-slate-200 h-auto w-full flex  py-2 px-2"
                                onClick={() => {
                                    if (watchIndex != i)
                                        form.setValue("index", i);
                                }}
                            >
                                <div className="flex justify-between items-center flex-1 space-x-4">
                                    <div className="flex flex-col items-start">
                                        <div className="text-start text-muted-foreground">
                                            {f.title || "New Cost"}
                                        </div>
                                        <div>
                                            <Money
                                                value={f?.meta?.grandTotal}
                                            ></Money>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge className="" variant={"outline"}>
                                            {form.getValues(`stats.${f._id}`) ||
                                                0}
                                        </Badge>
                                    </div>
                                </div>
                            </Button>
                            <ConfirmBtn
                                onClick={async () => {
                                    if (watchIndex == i && fields.length > 1) {
                                        if (
                                            watchIndex > 0 &&
                                            fields.length - 1 == watchIndex
                                        )
                                            form.setValue("index", i + 1);
                                        //    changeIndex(i - 1);
                                    }
                                    if (fields.length == 1) createCost();
                                    await _deleteCommunityModelCost(f._id);
                                    remove(i);

                                    // changeIndex()
                                }}
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "group-hover:opacity-100 opacity-20"
                                )}
                                trash
                            ></ConfirmBtn>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
function CostForm({ form, data, watchIndex }: Props) {
    // const index = form.watch("index");
    const { prepend, remove, fields } = useFieldArray({
        control: form.control,
        name: "costs"
    });
    // const [refresh, startTransition] = useTransition();
    const costForm = useForm<ICommunityCosts>({});
    useEffect(() => {
        // console.log("CHANGED");
        const { id, _id, ...c } = deepCopy(fields[watchIndex] || {}) as any;
        // console.log(fieldData);
        if (c.startDate) c.startDate = new Date(c.startDate);
        if (c.endDate) c.endDate = new Date(c.endDate);
        startTransition2(() => {
            costForm.reset({
                ...c,
                id: _id
            });
        });
    }, [watchIndex, fields, costForm]);

    async function initialize(costId) {
        console.log(costId);
    }
    const [isSaving, startTransition] = useTransition();
    const [refresh, startTransition2] = useTransition();
    async function submit() {
        startTransition(async () => {
            try {
                const cost = deepCopy<ICommunityCosts>(costForm.getValues());
                console.log(cost.id);
                if (!cost.startDate) {
                    toast.error("Add a valid starting date");
                    return;
                }
                if (!cost.endDate) {
                    const cIndex = fields.findIndex(c => c._id && !c.endDate);
                    if (cIndex > -1 && cIndex != index) {
                        toast.error("Only one cost can have empty end date");
                        return;
                    }
                }

                cost.meta = calculateCommunitModelCost(
                    cost.meta,
                    data.project?.builder?.meta?.tasks
                );
                cost.model = data.modelName;
                const { _id, community, ..._cost } = cost as any;

                const c = await _saveCommunitModelCostData(
                    _cost as any,
                    data.id,
                    data.pivotId
                );
                // c.meta.grandTotal
                toast.success("Saved!");

                form.setValue(`costs.${watchIndex}` as any, {
                    ...c,
                    _id
                });
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }

    return (
        <Form {...costForm}>
            <Tabs defaultValue="overview" className="space-y-4 flex-1">
                <TabsList className="">
                    <TabsTrigger value="overview">Task Costs</TabsTrigger>
                    <TabsTrigger value="analytics">Units</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    {!refresh && (
                        <>
                            <ReRender form={costForm}></ReRender>
                            <div className="grid flex-1 grid-cols-4  pl-2 gap-2">
                                <div className="col-span-2 grid gap-2">
                                    <Label>From</Label>
                                    <DatePicker
                                        className="w-auto h-8"
                                        setValue={e =>
                                            costForm.setValue(`startDate`, e)
                                        }
                                        value={costForm.getValues(`startDate`)}
                                    />
                                </div>
                                <div className="col-span-2 grid gap-2">
                                    <Label>To</Label>
                                    <DatePicker
                                        className="w-auto h-8"
                                        setValue={e =>
                                            costForm.setValue(`endDate`, e)
                                        }
                                        value={costForm.getValues(`endDate`)}
                                    />
                                </div>
                                <div className="col-span-5 grid-cols-7 grid bg-slate-100 py-2">
                                    <Label className="col-span-3 mx-2">
                                        Tasks
                                    </Label>
                                    <Label className="col-span-2">
                                        Cost ($)
                                    </Label>
                                    <Label className="col-span-2">
                                        Tax ($)
                                    </Label>
                                </div>
                                {data?.project?.builder?.meta?.tasks?.map(
                                    (t, _i) => (
                                        <div
                                            key={_i}
                                            className="col-span-4 gap-2 grid-cols-7 grid"
                                        >
                                            <div className="col-span-3">
                                                <Label>{t.name}</Label>
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    key="cost"
                                                    className="h-8"
                                                    {...costForm.register(
                                                        `meta.costs.${t.uid}`
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    {...costForm.register(
                                                        `meta.tax.${t.uid}`
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                                <div className="col-span-4 border-t pt-2 my-3 flex space-x-4">
                                    <FormField
                                        control={costForm.control}
                                        name={"meta.syncCompletedTasks"}
                                        render={({ field }) => (
                                            <FormItem className="space-x-2 space-y-0 flex items-center">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={
                                                            field.value as any
                                                        }
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel>
                                                    Update Completed Tasks
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex-1"></div>
                                    <Btn
                                        className="h-8"
                                        isLoading={isSaving}
                                        onClick={() => submit()}
                                        size="sm"
                                        type="submit"
                                    >
                                        Save
                                    </Btn>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </Form>
    );
}
