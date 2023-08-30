"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";

import { Label } from "../ui/label";
import { CustomerTypes } from "@prisma/client";

import { IHome, IProject } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { projectSchema } from "@/lib/validations/community-validations";
import { staticProjectsAction } from "@/app/_actions/community/projects";
import { staticHomeModels } from "@/app/_actions/community/static-home-models";
import SelectInput from "../ui-customs/select";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DatePicker } from "../date-range-picker";
import ConfirmBtn from "../confirm-btn";
import AutoComplete2 from "../auto-complete-headless";

export default function HomeModal() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<{
    units: IHome[];
  }>({
    defaultValues: {
      units: [],
    },
  });
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "units",
  });
  const [profiles, setProfiles] = useState<CustomerProfiles[]>([]);
  async function submit() {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        const isValid = projectSchema.parse(form.getValues());

        // await saveProject({
        //   ...form.getValues(),
        // });
        closeModal();
        toast.message("Customer Created!");
        route.refresh();
      } catch (error) {
        console.log(error);
        toast.message("Invalid Form");
        return;
      }
    });
  }
  const projects = useAppSelector((state) => state?.slicers?.staticProjects);
  const models = useAppSelector((state) => state?.slicers?.staticModels);
  function register(i, key: keyof IHome) {
    return form.register(`units.${i}.${key}` as any);
  }
  async function init(data) {
    loadStaticList("staticProjects", projects, staticProjectsAction);
    loadStaticList("staticModels", models, staticHomeModels);
    console.log(">>>");
    form.reset(
      !data
        ? {
            units: [
              { meta: {} },
              { meta: {} },
              { meta: {} },
              { meta: {} },
              { meta: {} },
              { meta: {} },
            ],
          }
        : {
            ...data,
          }
    );
  }
  return (
    <BaseModal<IProject | undefined>
      className="sm:max-w-[750px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="home"
      Title={({ data }) => <div>Create Project</div>}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <AutoComplete2
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
                  <Label className="col-span-2">Model Name</Label>
                  <Label className="col-span-1">Blk</Label>
                  <Label className="col-span-1">Lot</Label>
                  <Label className="col-span-2">Date</Label>
                  <Label className="col-span-1">Home Key</Label>
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
                        formKey={`units.${i}.modelName`}
                        options={models}
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
                          form.setValue(`units.${i}.createdAt`, e)
                        }
                        value={form.getValues(`units.${i}.createdAt`)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-between items-center">
                      <Input
                        className="h-7"
                        placeholder=""
                        {...register(i, "homeKey")}
                      />
                      <div className="flex justify-end">
                        <ConfirmBtn
                          onClick={() => {
                            remove(i);
                          }}
                          variant="ghost"
                          size="icon"
                          className=""
                          trash
                        ></ConfirmBtn>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    append(({
                      meta: {},
                    } as Partial<IHome>) as any);
                  }}
                  variant="secondary"
                  className="w-full h-7 mt-1"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  <span>Add Task</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          isLoading={isSaving}
          onClick={() => submit()}
          size="sm"
          type="submit"
        >
          Save
        </Btn>
      )}
    />
  );
}
