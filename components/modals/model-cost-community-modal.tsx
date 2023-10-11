"use client";

import React, { useEffect, useState, useTransition } from "react";

import Btn from "../btn";
import BaseModal from "./base-modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ICommunityModelCost, ICommunityTemplate } from "@/types/community";
import { deepCopy } from "@/lib/deep-copy";
import { _saveCommunityModelCost } from "@/app/_actions/community/community-template";
import { closeModal } from "@/lib/modal";
import { calculateCommunitModelCost } from "@/lib/community/community-utils";

export default function ModelCostCommunityModal() {
    const [isSaving, startTransition] = useTransition();
    const form = useForm<{ cost: ICommunityModelCost }>({
        defaultValues: {}
    });

    async function submit(data: ICommunityTemplate) {
        startTransition(async () => {
            try {
                const cost = calculateCommunitModelCost(
                    deepCopy<ICommunityModelCost>(form.getValues(`cost`)),
                    data.project?.builder?.meta?.tasks
                );
                const c = await _saveCommunityModelCost(data.id, {
                    ...data.meta,
                    modelCost: cost
                });
                toast.success("Saved!");
                closeModal();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    async function init(data: ICommunityTemplate) {
        const cost = data.meta?.modelCost || {};

        form.reset({
            cost
        });
    }
    return (
        <BaseModal<ICommunityTemplate>
            className="sm:max-w-[700px]"
            onOpen={data => {
                init(data);
            }}
            onClose={() => {}}
            modalName="communityModelCost"
            Title={({ data }) => <div>Model Cost</div>}
            Content={({ data }) => (
                <div className="flex w-full divide-x">
                    <div className="grid flex-1 grid-cols-4  pl-2 gap-2">
                        <div className="col-span-4 grid-cols-4 grid bg-slate-100 py-2">
                            <Label className="col-span-2 mx-2">Tasks</Label>
                            <Label className="col-span-1">Cost ($)</Label>
                            <Label className="col-span-1">Tax ($)</Label>
                        </div>
                        {data?.project?.builder?.meta?.tasks?.map((t, _i) => (
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
                                            `cost.costs.${t.uid}`
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Input
                                        type="number"
                                        className="h-8"
                                        {...form.register(`cost.tax.${t.uid}`)}
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
