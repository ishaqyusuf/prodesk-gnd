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
import { ICustomer } from "@/types/customers";
import { DateCellContent, SecondaryCellContent } from "../columns/base-columns";
import { ScrollArea } from "../ui/scroll-area";
import { dispatchSlice } from "@/store/slicers";
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
    checkNo: string;
    paymentOption: IPaymentOptions;
  }>({
    defaultValues: {
      pay: 0,
    },
  });
  const watchPaymentOption = form.watch("paymentOption");
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
  async function submit(data: ICustomer) {
    startTransition(async () => {
      let credit = +form.getValues("pay");
      let balance = +form.getValues("pay") + (data.wallet?.balance || 0);
      let debit = 0;

      // if (_total > total) {
      //   toast.error(
      //     "Invalid: Payment cannot be greater than Total Amount Due."
      //   );
      //   return;
      // }
      if (balance == 0) {
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
          orderId,
          meta: { payment_option: paymentOption } = {},
        } = s;
        if (amountDue && balance >= amountDue) {
          balance -= amountDue;
          amountPaid = Number(s.amountDue);
          amountDue -= amountPaid;
          debit += amountDue;
        } else if (balance > 0 && (amountDue || 0) > balance) {
          amountPaid = balance;
          debit += balance;
          amountDue = (amountDue || 0) - balance;
          balance = 0;
        }
        orders.push({
          amountPaid,
          id,
          amountDue,
          customerId,
          orderId,
          checkNo: form.getValues("checkNo"),
          paymentOption: form.getValues("paymentOption"),
        });
      });

      // console.log({ orders, totalAmount, balance });
      // return;
      // .filter((f) => (f?.amountPaid || 0) > 0);
      await applyPaymentAction({ orders, debit, credit, balance });
      route.refresh();
      closeModal();
      toast.message("Payment Applied Succesfully");
      dispatchSlice("salesPaymentCustomers");
    });
  }
  return (
    <BaseModal<ICustomer>
      className="sm:max-w-[550px]"
      onOpen={(customer) => {
        form.reset({
          paymentOption: customer.salesOrders[0]?.meta?.payment_option,
        });
        const _checked: any = {};
        customer.salesOrders?.map((o) => (_checked[o.orderId] = o));
        setSelection(_checked);
      }}
      onClose={() => {}}
      modalName="salesPayment"
      Title={({ data: customer }) => (
        <div>Apply Payment - {customer?.businessName || customer?.name}</div>
      )}
      Content={({ data: customer }) => (
        <div className="grid gap-2">
          <ScrollArea className="min-h-[150px] max-h-[450px]">
            <Table className="w-full ">
              <TableHeader>
                <TableRow>
                  {(customer?.salesOrders?.length || 0) > 1 && (
                    <TableHead className=""></TableHead>
                  )}
                  <TableHead className="">Order</TableHead>
                  <TableHead className="text-end">Amount Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer?.salesOrders?.map((item) => (
                  <TableRow key={item.id}>
                    {customer.salesOrders.length > 1 && (
                      <TableCell className="p-2" id="checker">
                        <Checkbox
                          checked={selection[item.orderId] != null}
                          onCheckedChange={(e) => {
                            console.log(e);
                            const selectn: any = deepCopy(selection);
                            selectn[item.orderId as any] = e
                              ? deepCopy(item)
                              : null;
                            setSelection(selectn);
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell className="p-2" id="order">
                      <p className="font-semibold">{item.orderId}</p>
                      <SecondaryCellContent>
                        <DateCellContent>{item.createdAt}</DateCellContent>
                      </SecondaryCellContent>
                    </TableCell>
                    <TableCell className="text-end p-2" id="order">
                      <p>$ {item.amountDue}</p>
                      <p className="text-muted-foreground">
                        {item.meta?.payment_option}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => {
                            form.setValue("pay", total);
                          }}
                        >
                          <Money className="font-semibold" value={total} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to pay all total</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex space-x-4 justify-end">
            <div className="grid gap-2">
              <Label>Wallet</Label>
              <Money value={customer?.wallet?.balance} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Option</Label>
              <Select
                value={watchPaymentOption}
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
              <Label>Check No</Label>
              <Input
                disabled={form.getValues("paymentOption") != "Check"}
                {...form.register("checkNo")}
                className="h-8 w-28"
                type="number"
              />
            </div>

            <div className="grid gap-2">
              <Label>Pay</Label>
              <Input
                {...form.register("pay")}
                className="h-8 w-28"
                type="number"
              />
            </div>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          disabled={form.getValues("pay") == 0}
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
