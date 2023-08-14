"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { IPaymentOptions, ISalesOrder } from "@/types/sales";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { toast } from "sonner";
import {
  PaymentOrderProps,
  applyPaymentAction,
} from "@/app/_actions/sales/sales-payment";
import { Checkbox } from "../ui/checkbox";
import { deepCopy } from "@/lib/deep-copy";
import { Info } from "../info";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Money from "../money";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { closeModal } from "@/lib/modal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { UseFormReturn } from "react-hook-form/dist/types";

export default function SalesPaymentModal() {
  const [selection, setSelection] = useState<
    {
      [id in string]: ISalesOrder | undefined;
    }
  >({});
  const form = useForm<{
    // pay: number | null | undefined | string
    pay: number;
    paymentOption: string;
  }>({
    defaultValues: {
      pay: 0,
    },
  });
  // const watchPay = form.watch("pay");
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let total = 0;
    Object.values<ISalesOrder | undefined>(selection).map(
      (v) => (total += v?.amountDue || 0)
    );
    setTotal(total);
    form.setValue("pay", total);
  }, [selection]);
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  async function submit() {
    startTransition(async () => {
      let _total = form.getValues("pay");
      if (_total > total) {
        toast.error(
          "Invalid: Payment cannot be greater than Total Amount Due."
        );
        return;
      }
      if (_total == 0) {
        toast.error("Invalid: Payment must be greater than 0");
        return;
      }
      const orders: PaymentOrderProps[] = [];
      Object.values<ISalesOrder | undefined>(selection).map((s) => {
        if (!s) return null;
        let amountPaid: number = 0;
        let {
          id,
          amountDue = 0,
          customerId,
          meta: { payment_option: paymentOption } = {},
        } = s;
        if (amountDue && _total >= amountDue) {
          _total -= amountDue;
          amountPaid = Number(s.amountDue);
          amountDue -= amountPaid;
        } else if (_total > 0 && (amountDue || 0) > _total) {
          amountPaid = _total;
          amountDue = (amountDue || 0) - _total;
          _total = 0;
        }
        orders.push({
          amountPaid,
          id,
          amountDue,
          customerId,
          paymentOption: form.getValues("paymentOption"),
        });
      });
      // .filter((f) => (f?.amountPaid || 0) > 0);
      await applyPaymentAction({ orders });
      route.refresh();
      closeModal();
      toast.message("Payment Applied Succesfully");
    });
  }
  return (
    <BaseModal<ISalesOrder[]>
      className="sm:max-w-[550px]"
      onOpen={(orders) => {
        form.reset({
          paymentOption: orders[0]?.meta?.payment_option,
        });
        const _checked: any = {};
        orders?.map((o) => (_checked[o.id] = o));
        setSelection(_checked);
      }}
      onClose={() => {}}
      modalName="salesPayment"
      Title={({ data: orders }) => <div>Apply Payment</div>}
      Content={({ data: orders }) => (
        <div className="grid gap-2">
          <Table className="w-full ">
            <TableHeader>
              <TableRow>
                {(orders?.length || 0) > 1 && (
                  <TableHead className=""></TableHead>
                )}
                <TableHead className="">Order</TableHead>
                <TableHead className="text-end">Amount Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((item) => (
                <TableRow key={item.id}>
                  {orders.length > 1 && (
                    <TableCell id="checker">
                      <Checkbox
                        checked={selection[item.orderId] != null}
                        onCheckedChange={(e) => {
                          selection[item.orderId as any] = e
                            ? deepCopy(item)
                            : undefined;
                          setSelection(selection);
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell id="order">
                    <p className="font-semibold">{item.orderId}</p>
                  </TableCell>
                  <TableCell className="text-end" id="order">
                    <p>$ {item.amountDue}</p>
                    <p className="text-muted-foreground">
                      {item.meta?.payment_option}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex space-x-4 justify-end">
            <div className="grid gap-2">
              <Label>Payment Option</Label>
              <Select
                value={form.getValues("paymentOption")}
                onValueChange={(value) => {
                  form.setValue("paymentOption", value as IPaymentOptions);
                }}
              >
                <SelectTrigger className="h-8 w-28">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[
                      "Cash",
                      // "Credit Card",
                      "Check",
                      "COD",
                      "Zelle",
                    ].map((opt, i) => (
                      <SelectItem value={opt} key={i}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Pay</Label>
              <Input
                {...form.register("pay")}
                className="h-8 w-24"
                type="number"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  onClick={() => {
                    form.setValue("pay", total);
                  }}
                >
                  <Info className="text-end cursor-pointer" label="Total">
                    <Money value={total} />
                  </Info>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to pay all total</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          disabled={form.getValues("pay") == 0}
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
