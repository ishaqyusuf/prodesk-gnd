"use client";

import { Label } from "@/components/ui/label";
import { ISalesOrderForm } from "@/types/sales";
import { SalesCustomerProfileInput } from "./customer-profile-input";
import { SalesFormResponse } from "@/app/_actions/sales/sales-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-range-picker";

export default function InfoCard({
  form,
  data,
}: {
  form: ISalesOrderForm;
  data: SalesFormResponse;
}) {
  const watchPaymentTerm = form.getValues("paymentTerm");
  const watchType = form.getValues("type");
  const watchGoodUntil = form.getValues("goodUntil");

  return (
    <div className="group relative  h-full w-full  rounded border border-slate-300 p-2 text-start hover:bg-slate-100s hover:shadows">
      <div className="space-y-1">
        <InfoLine label="Profile">
          <SalesCustomerProfileInput
            form={form}
            profiles={data?.ctx?.profiles}
          />
        </InfoLine>
        <InfoLine label="Q.B Order #">
          <Input
            className="h-6 w-[100px] uppercase"
            {...form.register("meta.qb")}
          />
        </InfoLine>
        <InfoLine label="Sales Rep">
          <span>{form.getValues("meta.rep")}</span>
        </InfoLine>
        <InfoLine label="P.O No.">
          <Input
            className="h-6 w-[100px] uppercase"
            {...form.register("meta.po")}
          />
        </InfoLine>
        {watchType == "order" && (
          <InfoLine label="Payment Terms">
            <Select
              value={watchPaymentTerm as any}
              onValueChange={(e) => form.setValue("paymentTerm", e)}
            >
              <SelectTrigger className="h-6 w-[100px]">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Net10">Net10</SelectItem>
                  <SelectItem value="Net20">Net20</SelectItem>
                  <SelectItem value="Net30">Net30</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </InfoLine>
        )}
        {watchType == "estimate" && (
          <InfoLine label="Good Until">
            <DatePicker
              value={watchGoodUntil}
              setValue={(v) => form.setValue("goodUntil", v)}
              className="h-8 w-[150px]"
            />
            {/* <Select
              value={watchPaymentTerm as any}
              onValueChange={(e) => form.setValue("paymentTerm", e)}
            >
              <SelectTrigger className="h-6 w-[100px]">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Net10">Net10</SelectItem>
                  <SelectItem value="Net20">Net20</SelectItem>
                  <SelectItem value="Net30">Net30</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select> */}
          </InfoLine>
        )}
      </div>
    </div>
  );
}
function InfoLine({ label, children }) {
  return (
    <div className="  md:grid md:grid-cols-2 items-center xl:grid-cols-3">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="text-end flex justify-end text-sm xl:col-span-2">
        {children}
      </div>
    </div>
  );
}
