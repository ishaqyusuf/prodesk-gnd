"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { ISalesOrder } from "@/types/sales";

import { getProductionUsersAction } from "@/app/_actions/hrm";
import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import {
  PaymentOrderProps,
  applyPaymentAction,
} from "@/app/_actions/sales/sales-payment";
import { Checkbox } from "../ui/checkbox";
import { deepCopy } from "@/lib/deep-copy";
import { Info } from "../info";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import {
  TimelineUpdateProps,
  updateTimelineAction,
} from "@/app/_actions/progress";
import { Textarea } from "../ui/textarea";
import { capitalizeFirstLetter } from "@/lib/utils";
// import { UseFormReturn } from "react-hook-form/dist/types";

interface Props {
  isProd?: Boolean;
}
export default function SalesTimelineModal({ isProd }: Props) {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<TimelineUpdateProps>({
    defaultValues: {},
  });

  const watchType = form.watch("type");
  useEffect(() => {
    form.setValue(
      "status",
      [watchType, "update"].map((c) => capitalizeFirstLetter(c)).join(" ")
    );
  }, [watchType]);
  async function submit() {
    startTransition(async () => {
      await updateTimelineAction("SalesOrder", {
        ...form.getValues(),
      });
      route.refresh();
      closeModal("salesTimeline");
      toast.message("Timeline updated!");
    });
  }
  return (
    <BaseModal<ISalesOrder>
      className="sm:max-w-[550px]"
      onOpen={(order) => {
        form.reset({
          parentId: order?.id,
          note: "",
          status: isProd ? "Production Update" : "Order Update",
          type: isProd ? "production" : "",
        });
      }}
      onClose={() => {}}
      modalName="salesTimeline"
      Title={({ data: order }) => <div>Update Timeline</div>}
      Content={({ data: order }) => (
        <div className="grid md:grid-cols-2 gap-4">
          <Info className="" label="Update Type">
            <Select
              value={watchType}
              onValueChange={(e) => form.setValue("type", e)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Info>
          <Info className="" label="Headline">
            <Input {...form.register("status")} />
          </Info>
          <Info className="col-span-2" label="Note">
            <Textarea {...form.register("note")} />
          </Info>
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
