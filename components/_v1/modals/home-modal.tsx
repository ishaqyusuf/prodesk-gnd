"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";

import { Label } from "../../ui/label";

import { ICommunityTemplate, IHome, IProject } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import {
    homeSchema,
    projectSchema,
} from "@/lib/validations/community-validations";
import { staticProjectsAction } from "@/app/(v1)/_actions/community/projects";
import { staticHomeModels } from "@/app/(v1)/_actions/community/static-home-models";
import SelectInput from "../ui-customs/select";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { DatePicker } from "../date-range-picker";
import ConfirmBtn from "../confirm-btn";
import AutoComplete2 from "../auto-complete-tw";
import {
    _updateCommunityHome,
    createHomesAction,
} from "@/app/(v1)/_actions/community/create-homes";
import { getModelNumber } from "@/lib/utils";
import { homeSearchMeta } from "@/lib/community/community-utils";
import { staticCommunity } from "@/app/(v1)/_actions/community/community-template";

interface FormProps {
    units: IHome[];
    projectId: null;
}
export default function HomeModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<FormProps>({
        defaultValues: {
            units: [{ meta: {} }],
        },
    });
    const { fields, remove, append } = useFieldArray({
        control: form.control,
        name: "units",
    });
    const projectId = form.watch("projectId");
    async function submit(data) {
        startTransition(async () => {
            // if(!form.getValues)
            let msg = "Units Created!";
            try {
                const formData = form.getValues();
                if (data?.id) {
                    const unit = formData.units[0] as any;
                    unit.modelName = communityTemplates.find(
                        (f) => f.id == unit.communityTemplateId
                    )?.modelName as any;
                    await _updateCommunityHome(formData.units[0] as any);
                    msg = "Unit updated!";
                } else {
                    const isValid = homeSchema.parse(form.getValues());
                    await createHomesAction(
                        formData.units.map((u) => {
                            const pid = (u.projectId = Number(
                                formData.projectId
                            ));
                            u.modelName = communityTemplates.find(
                                (f) => f.id == u.communityTemplateId
                            )?.modelName as any;
                            u.modelNo = getModelNumber(u.modelName);
                            u.builderId = Number(
                                projects.find((p) => p.id == pid)?.builderId
                            );
                            // u.communityTemplateId = Number(
                            //     communityTemplates.find(
                            //         p =>
                            //             p.projectId == pid &&
                            //             p.modelName.toLowerCase() == u.modelName
                            //     )?.id
                            // );
                            u.search = homeSearchMeta(u);
                            u.slug;
                            return u;
                        }) as any
                    );
                }
                // await saveProject({
                //   ...form.getValues(),
                // });

                closeModal();
                toast.message(msg);
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    function register(i, key: keyof IHome) {
        return form.register(`units.${i}.${key}` as any);
    }
    const [projects, setProjects] = useState<IProject[]>([]);
    const [communityTemplates, setCommunityTemplates] = useState<
        ICommunityTemplate[]
    >([]);
    useEffect(() => {
        async function loadStatics() {
            setProjects((await staticProjectsAction()) as any);
            const cTemplates = (await staticCommunity()) as any;
            // console.log(cTemplates);
            setCommunityTemplates(cTemplates);
        }

        loadStatics();
        // loadStaticList("staticProjects", projects, staticProjectsAction);
        // loadStaticList("staticModels", models, staticHomeModels);
        // loadStaticList("staticCommunity", communityTemplates, staticCommunity);
    }, []);
    async function init(data) {
        form.setValue("units", data ? [data] : ([{ meta: {} }] as any));
        console.log(data);
        if (data?.projectId) form.setValue("projectId", data.projectId);
    }
    return (
        <BaseModal<IProject | undefined>
            className="sm:max-w-[750px]"
            onOpen={(data) => {
                init(data);
            }}
            onClose={() => {}}
            modalName="home"
            Title={({ data }) => <div>Create Units</div>}
            Content={({ data }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <AutoComplete2
                                disabled={data?.id}
                                label="Project"
                                form={form}
                                formKey={"projectId"}
                                options={projects}
                                itemText={"title"}
                                itemValue="id"
                            />
                            {/* <SelectInput
                label="Project" 
                form={form}
                formKey={"projectId"}
                options={projects}
                labelKey={"title"}
                valueKey="id"
              /> */}
                        </div>

                        <div className="grid col-span-2 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 grid gap-2">
                                <div className="grid w-full grid-cols-7 gap-2">
                                    <Label className="col-span-2">
                                        Model Name
                                    </Label>
                                    <Label className="col-span-1">Blk</Label>
                                    <Label className="col-span-1">Lot</Label>
                                    <Label className="col-span-2">Date</Label>
                                    <Label className="col-span-1">
                                        Home Key
                                    </Label>
                                </div>
                                {fields?.map((f, i) => (
                                    <div
                                        className="grid w-full grid-cols-7 gap-2 items-center group"
                                        key={i}
                                    >
                                        <div className="col-span-2">
                                            {/* <SelectInput
                        form={form}
                        formKey={`units.${i}.modelName`}
                        options={models}
                        labelKey={"modelName"}
                        valueKey="id"
                      /> */}
                                            <AutoComplete2
                                                form={form}
                                                formKey={`units.${i}.communityTemplateId`}
                                                options={communityTemplates?.filter(
                                                    (m) =>
                                                        m.projectId == projectId
                                                )}
                                                onSelect={(e) => {
                                                    console.log(e);
                                                }}
                                                uppercase
                                                itemText={"modelName"}
                                                itemValue="id"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                className="h-7"
                                                placeholder=""
                                                {...register(i, "block")}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                className="h-7"
                                                placeholder=""
                                                {...register(i, "lot")}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <DatePicker
                                                className="w-auto h-7"
                                                setValue={(e) =>
                                                    form.setValue(
                                                        `units.${i}.createdAt`,
                                                        e
                                                    )
                                                }
                                                value={form.getValues(
                                                    `units.${i}.createdAt`
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-between items-center">
                                            <Input
                                                className="h-7"
                                                placeholder=""
                                                {...register(i, "homeKey")}
                                            />
                                            <div className="flex justify-end">
                                                {!data?.id && (
                                                    <ConfirmBtn
                                                        onClick={() => {
                                                            remove(i);
                                                        }}
                                                        variant="ghost"
                                                        size="icon"
                                                        className=""
                                                        trash
                                                    ></ConfirmBtn>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!data?.id && (
                                    <Button
                                        onClick={() => {
                                            append({
                                                meta: {},
                                            } as Partial<IHome> as any);
                                        }}
                                        variant="secondary"
                                        className="w-full h-7 mt-1"
                                    >
                                        <Plus className="mr-2 w-4 h-4" />
                                        <span>Add Task</span>
                                    </Button>
                                )}
                            </div>
                        </div>
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
