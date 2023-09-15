"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import { saveCustomer } from "@/app/_actions/sales/sales-customers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { projectSchema } from "@/lib/validations/community-validations";
import { IInboundOrder } from "@/types/sales-inbound";
import AutoComplete from "../auto-complete";
import { useAppSelector } from "@/store";
import { GetInboundFormReponse } from "@/app/_actions/sales-inbound/get-form";
import { ISalesOrderItem } from "@/types/sales";
import { inboundFormSchema } from "@/lib/validations/inbound-validation";
import { uniqueBy } from "@/lib/utils";
import { createInboundOrder } from "@/app/_actions/sales-inbound/crud";

export default function InboundModal() {
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  const form = useForm<IInboundOrder>({
    defaultValues: {},
  });
  const pageData = useAppSelector<GetInboundFormReponse>(
    (s) => s.slicers.dataPage?.data as any
  );

  async function submit(items: ISalesOrderItem[]) {
    startTransition(async () => {
      // if(!form.getValues)
      try {
        const formdata = form.getValues();
        const isValid = inboundFormSchema.parse(formdata);
        await createInboundOrder(
          form.getValues(),
          items.map((i) => ({
            qty: i.qty,
            supplier: i.supplier,
            status: formdata.status,
            unitCost: i.price,
            totalCost: i.total,
            salesOrderItemId: i.id,
          })) as any
        );
        // await saveProject({
        //   ...form.getValues(),
        // });
        closeModal();
        toast.message("Inbound Created!");
        // route.push("/sales/inbounds");
        route.refresh();
      } catch (error) {
        console.log(error);
        toast.message("Invalid Form");
        return;
      }
    });
  }

  async function init(items: ISalesOrderItem[]) {
    form.reset({
      status: "Order Placed",
      supplier: uniqueBy(items || [], "supplier")
        ?.map((i) => i?.supplier)
        ?.filter(Boolean)
        .join(","),
      reference: "",
      meta: {},
    });
  }

  return (
    <BaseModal<ISalesOrderItem[]>
      className="sm:max-w-[550px]"
      onOpen={(data) => {
        init(data);
      }}
      onClose={() => {}}
      modalName="inboundModal"
      Title={({ data }) => <div>Create Inbound</div>}
      Content={({ data }) => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label>Order Reference</Label>
              <Input
                placeholder=""
                className="h-8"
                {...form.register("reference")}
              />
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              {/* {Object.keys(pageData)} */}
              <Input
                className="h-8"
                {...form.register("supplier")}
                placeholder=""
              />
              {/* <AutoComplete
                form={form}
                formKey={"supplier"}
                options={pageData?.suppliers}
                placeholder=""
                className="h-8"
              /> */}
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <AutoComplete
                form={form}
                formKey={"status"}
                options={[
                  "Pending",
                  "Order Placed",
                  "In Transit",
                  "Arrived Warehouse",
                  "Stocked",
                ]}
                placeholder=""
                className="h-8"
              />
            </div>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          isLoading={isSaving}
          onClick={() => submit(data as any)}
          size="sm"
          type="submit"
        >
          Save
        </Btn>
      )}
    />
  );
}
