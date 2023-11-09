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
import { IBuilder } from "@/types/community";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Plus, Trash } from "lucide-react";
import { generateRandomString } from "@/lib/utils";
import {
    addBuilderTasks,
    deleteBuilderTasks,
    saveBuilder,
    saveBuilderInstallations,
    saveBuilderTasks
} from "@/app/_actions/community/builders";
import { Form, FormField } from "../ui/form";
import { CheckedState } from "@radix-ui/react-checkbox";

export default function BuilderModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<IBuilder>({
        defaultValues: {}
    });
    const [taskIds, setTaskIds] = useState([]);
    const { fields, remove, append } = useFieldArray({
        control: form.control,
        name: "meta.tasks"
    });
    async function submit(type) {
        startTransition(async () => {
            // if(!form.getValues)
            const data = form.getValues();

            try {
                if (type == "main" || !type) {
                    await saveBuilder(data);
                }
                if (type == "tasks") {
                    let { tasks, ...meta } = data.meta;
                    const newTaskIds: any = [];
                    let deleteIds: any = [...taskIds];
                    if (Array.isArray(tasks)) {
                        data.meta.tasks = tasks.map(t => {
                            if (!t.uid) {
                                t.uid = generateRandomString(4);
                                newTaskIds.push(t.uid);
                            }
                            deleteIds = deleteIds.filter(d => d != t.uid);
                            return t;
                        });
                    }

                    // console.log(deleteIds, newTaskIds);
                    await saveBuilderTasks(data, deleteIds, newTaskIds);
                }
                if (type == "installations")
                    await saveBuilderInstallations(data);
                // const isValid = emailSchema.parse(form.getValues());

                closeModal();
                toast.message("Success!");
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    async function init(data) {
        form.reset(data || { meta: {} });
        setTaskIds(data?.meta?.tasks?.map(t => t.uid) || []);
    }
    return (
        <BaseModal<{
            type: "main" | "tasks" | "installations";
            data: any;
        }>
            className="sm:max-w-[700px]"
            onOpen={data => {
                init(data?.data);
            }}
            onClose={() => {}}
            modalName="builder"
            Title={({ data }) => <div>Builder Form</div>}
            Content={({ data }) => (
                <Form {...form}>
                    <div className="grid md:grid-cols-2 gap-4">
                        {(data?.type == "main" || !data?.type) && (
                            <>
                                <div className="grid gap-2 col-span-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="Builder Name"
                                        className="h-8"
                                        {...form.register("name")}
                                    />
                                </div>
                                <div className="grid gap-2 col-span-2">
                                    <Label>Address</Label>
                                    <Input
                                        placeholder="Address"
                                        className="h-8"
                                        {...form.register("meta.address")}
                                    />
                                </div>
                            </>
                        )}
                        {data?.type == "tasks" && (
                            <>
                                <div className="col-span-2 grid gap-2">
                                    <div className="grid grid-cols-10 gap-2">
                                        <Label className="col-span-4">
                                            Task Name
                                        </Label>
                                        {/* <Label className="col-span-2">
                                            Invoice Search
                                        </Label> */}
                                        <Label className="col-span-1 text-center">
                                            Bill.
                                        </Label>
                                        <Label className="col-span-1 text-center">
                                            Addon.
                                        </Label>
                                        <Label className="col-span-1 text-center">
                                            Prod.
                                        </Label>
                                        <Label className="col-span-1 text-center">
                                            Contr.
                                        </Label>
                                        <Label className="col-span-1 text-center">
                                            Punch.
                                        </Label>
                                        <Label className="col-span-1 text-center">
                                            Deco.
                                        </Label>
                                        <Label className="col-span-1"></Label>
                                    </div>

                                    {fields?.map((f, i) => (
                                        <div
                                            className="grid grid-cols-12 gap-2 items-center group"
                                            key={i}
                                        >
                                            <div className="col-span-4">
                                                <Input
                                                    className="h-7"
                                                    placeholder=""
                                                    {...form.register(
                                                        `meta.tasks.${i}.name` as any
                                                    )}
                                                />
                                            </div>
                                            {/* <div className="col-span-2">
                                                <Input
                                                    className="h-7"
                                                    placeholder=""
                                                    {...form.register(
                                                        `meta.tasks.${i}.invoice_search` as any
                                                    )}
                                                />
                                            </div> */}
                                            {[
                                                "bill",
                                                "addon",
                                                "produceable",
                                                "installable",
                                                "punchout",
                                                "deco"
                                            ].map(k => (
                                                <div
                                                    key={k}
                                                    className="flex justify-center"
                                                >
                                                    <FormField
                                                        name={
                                                            `meta.tasks.${i}.${k}` as any
                                                        }
                                                        control={form.control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                id="component"
                                                                checked={
                                                                    field.value as CheckedState
                                                                }
                                                                onCheckedChange={
                                                                    field.onChange
                                                                }
                                                            />
                                                        )}
                                                    />
                                                    {/* <Checkbox
                                                        checked={form.getValues(
                                                            `meta.tasks.${i}.${k}` as any
                                                        )}
                                                        onCheckedChange={e => {
                                                            form.setValue(
                                                                `meta.tasks.${i}.${k}` as any,
                                                                e
                                                            );
                                                        }}
                                                    /> */}
                                                </div>
                                            ))}

                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => {
                                                        // if (
                                                        //     !form.getValues(
                                                        //         `meta.tasks.${i}.uid` as any
                                                        //     )
                                                        // )
                                                        remove(i);
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className=""
                                                >
                                                    <Trash className="w-4 h-4 text-slate-300 group-hover:text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => {
                                            append({} as any);
                                        }}
                                        variant="secondary"
                                        className="w-full h-7 mt-1"
                                    >
                                        <Plus className="mr-2 w-4 h-4" />
                                        <span>Add Line</span>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Form>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit(data?.type)}
                    size="sm"
                    type="submit"
                >
                    Save
                </Btn>
            )}
        />
    );
}
