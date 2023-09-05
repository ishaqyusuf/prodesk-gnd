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
import { ExtendedHome, IHomeTask } from "@/types/community";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";

import { DatePicker } from "../date-range-picker";
import ConfirmBtn from "../confirm-btn";
import { deleteInvoiceTask } from "@/app/_actions/community-invoice/delete-invoice-task";
import {
  UpdateIvoiceTasksActionProps,
  updateInvoiceTasksAction,
} from "@/app/_actions/community-invoice/update-invoice-tasks";
import { UpdateOrderPriorityProps } from "@/types/sales";

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
  async function submit(data?: ExtendedHome) {
    if (!data) return;
    startTransition(async () => {
      try {
        const tasks = form.getValues("tasks");
        const payload: UpdateIvoiceTasksActionProps = {
          create: [],
          update: [],
        };
        tasks.map((t) => {
          t.amountDue = Number(t.amountDue);
          t.amountPaid = Number(t.amountPaid);
          console.log(t);
          if (!t.id)
            payload.create.push({
              ...t,
              homeId: data.id,
              projectId: data.projectId,
              search: data.search,
              meta: {},
            } as any);
          else {
            const old = data.tasks.find((ot) => ot.id == t.id);
            const { amountDue, amountPaid, checkNo, checkDate } = t;
            if (
              old?.amountDue != t.amountDue ||
              old?.amountPaid != t.amountPaid ||
              old?.checkNo != t.checkNo ||
              old?.checkDate != t.checkDate
            ) {
              payload.update.push({
                id: t.id,
                data: {
                  amountDue,
                  amountPaid,
                  checkNo,
                  checkDate,
                  createdAt: t.createdAt,
                } as any,
              });
            }
          }
        });
        await updateInvoiceTasksAction(payload);
        closeModal();
        toast.message("Invoice Updated!");
        route.refresh();
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
  async function deleteTask(i, task: IHomeTask) {
    if (task.id) await deleteInvoiceTask(task.id);
    remove(i);
  }
  return (
    <BaseModal<ExtendedHome>
      className="sm:max-w-[750px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="editInvoice"
      Title={({ data }) => (
        <div>
          {data?.project.title} {data?.modelName} {data?.block}
          {"/"}
          {data?.lot}
        </div>
      )}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="col-span-2 grid gap-2">
              <div className="grid grid-cols-7 gap-2">
                <Label className="col-span-2">Task Name</Label>
                <Label className="col-span-1">Due ($)</Label>
                <Label className="col-span-1">Paid ($)</Label>
                <Label className="col-span-1">Check</Label>
                <Label className="col-span-2">Date</Label>
              </div>
              {fields?.map((f, i) => (
                <div
                  className="grid grid-cols-7 gap-2 items-center group"
                  key={i}
                >
                  <div className="col-span-2">
                    <Input
                      className="h-7"
                      disabled={f.taskUid != null}
                      placeholder=""
                      {...register(i, "taskName")}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      className="h-7"
                      disabled={f.taskUid != null}
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
                      {...register(i, "amountPaid")}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      className="h-7"
                      placeholder=""
                      {...register(i, "checkNo")}
                    />
                  </div>
                  <div className="col-span-2 flex">
                    <div className="flex-1">
                      <DatePicker
                        format={"YYYY-MM-DD"}
                        className="flex-1 w-full h-7"
                        setValue={(e) =>
                          form.setValue(`tasks.${i}.checkDate`, e)
                        }
                        value={form.getValues(`tasks.${i}.checkDate`)}
                      />
                    </div>
                    <div className="">
                      <ConfirmBtn
                        disabled={f.taskUid != null}
                        onClick={() => {
                          deleteTask(i, f);
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
