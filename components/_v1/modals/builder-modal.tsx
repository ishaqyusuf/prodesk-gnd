"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { IBuilder } from "@/types/community";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { Plus, Trash } from "lucide-react";
import { chunkArray, generateRandomString } from "@/lib/utils";
import {
    saveBuilder,
    saveBuilderInstallations,
    saveBuilderTasks,
} from "@/app/(v1)/_actions/community/builders";
import { Form, FormField } from "../../ui/form";
import { CheckedState } from "@radix-ui/react-checkbox";
import { _updateBuilderMetaAction } from "@/app/(v2)/(loggedIn)/community-settings/builders/_actions/update-builder-action";
import {
    _getBuilderHomeIds,
    _syncBuilderTasks,
} from "@/app/(v2)/(loggedIn)/community-settings/builders/_actions/save-builder-task-action";
import { toastArrayAction } from "@/lib/toast-util";

export default function BuilderModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<IBuilder>({
        defaultValues: {},
    });
    const [taskIds, setTaskIds] = useState([]);
    const { fields, remove, append } = useFieldArray({
        control: form.control,
        name: "meta.tasks",
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
                        data.meta.tasks = tasks.map((t) => {
                            if (!t.uid) {
                                t.uid = generateRandomString(4);
                                newTaskIds.push(t.uid);
                            }
                            deleteIds = deleteIds.filter((d) => d != t.uid);
                            return t;
                        });
                    }
                    const b = await _updateBuilderMetaAction(
                        data.meta,
                        data.id
                    );
                    const homeIds = await _getBuilderHomeIds(data.id);
                    console.log(homeIds.length);
                    const a = await chunkArray(
                        homeIds.map(({ id }) => id),
                        500
                    );
                    // console.log(a[0]);
                    await toastArrayAction({
                        items: a,
                        serverAction: async (units) =>
                            await _syncBuilderTasks(
                                data,
                                deleteIds,
                                newTaskIds,
                                units
                            ),
                        loading(item) {
                            return "Synchronizing....";
                        },
                    });
                    // return;
                    // // console.log(deleteIds, newTaskIds);
                    // await saveBuilderTasks(data, deleteIds, newTaskIds);
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
        setTaskIds(data?.meta?.tasks?.map((t) => t.uid) || []);
    }
    return (
        <BaseModal<{
            type: "main" | "tasks" | "installations";
            data: IBuilder;
        }>
            className="sm:max-w-[700px]"
            onOpen={(data) => {
                init(data?.data);
            }}
            onClose={() => {}}
            modalName="builder"
            Title={({ data }) => (
                <div>{data?.data?.id ? data.data?.name : "Builder Form"}</div>
            )}
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
                                    <div className="grid grid-cols-11 gap-2">
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
                                            className="grid grid-cols-11 gap-2 items-center group"
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
                                                "deco",
                                            ].map((k) => (
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