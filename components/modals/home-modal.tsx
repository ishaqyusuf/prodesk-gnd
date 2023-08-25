"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import {
  getCustomerProfiles,
  saveCustomer,
} from "@/app/_actions/sales/sales-customers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { IHome, IProject } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticBuildersAction } from "@/app/_actions/community/builders";
import { projectSchema } from "@/lib/validations/community-validations";
import {
  saveProject,
  staticProjectsAction,
} from "@/app/_actions/community/projects";
import { staticHomeModels } from "@/app/_actions/community/static-home-models";
import SelectInput from "../ui-customs/select";

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
  const [profiles, setProfiles] = useState<CustomerTypes[]>([]);
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
  const models = useAppSelector((state) => state?.slicers?.staticBuilders);

  async function init(data) {
    loadStaticList("staticProjects", projects, staticProjectsAction);
    loadStaticList("staticModels", models, staticHomeModels);

    form.reset(
      !data
        ? {}
        : {
            ...data,
          }
    );
  }
  return (
    <BaseModal<IProject | undefined>
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="project"
      Title={({ data }) => <div>Create Project</div>}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <SelectInput
              label="Project"
              form={form}
              formKey={"projectId"}
              options={projects}
              labelKey={"title"}
              valueKey="id"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2 grid gap-2">
                <div className="grid grid-cols-8 gap-2">
                  <Label className="col-span-2">Model Name</Label>
                  <Label className="col-span-1">Lot</Label>
                  <Label className="col-span-1">Paid ($)</Label>
                  <Label className="col-span-1">Check</Label>
                  <Label className="col-span-2">Date</Label>
                  <Label className="col-span-1"></Label>
                </div>
                {/* {fields?.map((f, i) => (
                  <div
                    className="grid grid-cols-12 gap-2 items-center group"
                    key={i}
                  >
                    <div className="col-span-2">
                      <Input
                        className="h-7"
                        placeholder=""
                        {...register(i, "taskName")}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        className="h-7"
                        placeholder=""
                        type="number"
                        {...register(i, "amountDue")}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        className="h-7"
                        placeholder=""
                        type="number"
                        {...register(i, "amountDue")}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        className="h-7"
                        placeholder=""
                        {...register(i, "checkNo")}
                      />
                    </div>
                    <div className="col-span-2">
                      <DatePicker
                        className="w-auto h-7"
                        setValue={(e) =>
                          form.setValue(`tasks.${i}.checkDate`, e)
                        }
                        value={form.getValues(`tasks.${i}.checkDate`)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <ConfirmBtn
                        disabled={
                          form.getValues(`tasks.${i}.meta.system_task`) == true
                        }
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
                ))}
                <Button
                  onClick={() => {
                    append(({
                      meta: {
                        system_task: false,
                      },
                    } as Partial<IHomeTask>) as any);
                  }}
                  variant="secondary"
                  className="w-full h-7 mt-1"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  <span>Add Task</span>
                </Button> */}
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
