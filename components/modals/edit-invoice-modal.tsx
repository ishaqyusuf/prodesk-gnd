"use client";

import React, { useTransition } from "react";

import { useRouter } from "next/navigation";

import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useFieldArray, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { IHomeTask } from "@/types/community";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";

import { DatePicker } from "../date-range-picker";
import ConfirmBtn from "../confirm-btn";

export default function EditInvoiceModal() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<{
    tasks: IHomeTask[];
  }>({
    defaultValues: {
      tasks: [],
    },
  });
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "tasks",
  });
  async function submit(data) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        closeModal();
        toast.message("Customer Created!");
      } catch (error) {
        console.log(error);
        toast.message("Invalid Form");
        return;
      }
    });
  }
  async function init(data) {
    console.log(data);
    form.reset(data || { meta: {} });
  }
  function register(i, key: keyof IHomeTask) {
    return form.register(`tasks.${i}.${key}` as any);
  }
  return (
    <BaseModal
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="editInvoice"
      Title={({ data }) => <div>Invoice Form</div>}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2 grid gap-2">
              <div className="grid grid-cols-8 gap-2">
                <Label className="col-span-2">Task Name</Label>
                <Label className="col-span-1">Due ($)</Label>
                <Label className="col-span-1">Paid ($)</Label>
                <Label className="col-span-1">Check</Label>
                <Label className="col-span-2">Date</Label>
                <Label className="col-span-1"></Label>
              </div>
              {fields?.map((f, i) => (
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
                      setValue={(e) => form.setValue(`tasks.${i}.checkDate`, e)}
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
              </Button>
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
