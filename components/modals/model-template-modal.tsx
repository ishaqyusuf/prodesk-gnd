"use client";

import React, { useEffect, useTransition } from "react";

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
import { _serverAction, generateRandomString } from "@/lib/utils";
import {
    saveBuilder,
    saveBuilderInstallations,
    saveBuilderTasks,
    staticBuildersAction
} from "@/app/_actions/community/builders";
import { ModalName, loadStaticList } from "@/store/slicers";
import { CommunityModels } from "@prisma/client";
import { useAppSelector } from "@/store";
import { staticProjectsAction } from "@/app/_actions/community/projects";
import AutoComplete from "../auto-complete";
import {
    _createCommunityTemplate,
    _createModelTemplate,
    _updateCommunityModel
} from "@/app/_actions/community/home-template";

export default function ModelTemplateModal({
    formType = "modelTemplate"
}: {
    formType?: ModalName;
}) {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<CommunityModels>({
        defaultValues: {}
    });

    const projects = useAppSelector(state => state?.slicers?.staticProjects);
    const builders = useAppSelector(state => state?.slicers?.staticBuilders);
    useEffect(() => {
        loadStaticList("staticProjects", projects, staticProjectsAction);
        loadStaticList("staticBuilders", builders, staticBuildersAction);
    }, []);
    async function submit(_data) {
        startTransition(async () => {
            await _serverAction({
                fn: async () => {
                    const data: any = form.getValues();
                    data.meta = {};
                    if (_data?.id) {
                        await _updateCommunityModel(data, _data);
                        return;
                    }
                    formType == "communityTemplate"
                        ? await _createCommunityTemplate(
                              data,
                              projects.find(p => p.id == data.projectId)?.title
                          )
                        : await _createModelTemplate(
                              data,
                              builders.find(b => b.id == data.builderId)?.name
                          );
                },
                onSuccess: data => {
                    closeModal();
                    toast.success("Created!");
                }
            });
        });
    }
    async function init(data) {
        console.log(data);
        form.reset(data || { meta: {} });
    }
    return (
        <BaseModal<any>
            className="sm:max-w-[550px]"
            onOpen={data => {
                init(data);
            }}
            onClose={() => {}}
            modalName={formType}
            Title={({ data }) => <div>Model Form</div>}
            Content={({ data }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label>Model Name</Label>
                            <Input
                                placeholder="Model Name"
                                className="h-8"
                                {...form.register("modelName")}
                            />
                        </div>
                        {formType == "communityTemplate" ? (
                            <AutoComplete
                                label="Project"
                                disabled={data?.data?.id != null}
                                form={form}
                                formKey={"projectId"}
                                options={projects}
                                itemText={"title"}
                                itemValue={"id"}
                            />
                        ) : (
                            <AutoComplete
                                label="Builder"
                                form={form}
                                formKey={"builderId"}
                                options={builders}
                                itemText={"name"}
                                itemValue={"id"}
                            />
                        )}
                    </div>
                </div>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit(data)}
                    size="sm"
                    type="submit"
                >
                    Save
                </Btn>
            )}
        />
    );
}
