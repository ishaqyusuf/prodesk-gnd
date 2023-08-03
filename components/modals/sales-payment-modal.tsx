"use client";

import React, { useEffect, useState, useTransition } from "react";
import { store, useAppSelector } from "@/store";

import { useLoader } from "@/lib/use-loader";
import { dispatchSlice, updateSlice } from "@/store/slicers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { formatDate } from "@/lib/use-day";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ISalesOrder } from "@/types/sales";
import {
  UserProductionEventsProps,
  assignProductionAction,
  getUserProductionEventsAction,
} from "@/app/_actions/sales-production";
import { getProductionUsersAction } from "@/app/_actions/hrm";
import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import {
  PaymentOrderProps,
  applyPaymentAction,
} from "@/app/_actions/sales-payment";
import { Checkbox } from "../ui/checkbox";
import { deepCopy } from "@/lib/deep-copy";
import { Info } from "../info";
// import { UseFormReturn } from "react-hook-form/dist/types";

export default function SalesPaymentModal() {
  const [selection, setSelection] = useState<
    {
      [id in string]: ISalesOrder | undefined;
    }
  >({});
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let total = 0;
    Object.values<ISalesOrder | undefined>(selection).map(
      (v) => (total += v?.amountDue || 0)
    );
    console.log(selection);
    setTotal(total);
  }, [selection]);
  const route = useRouter();
  const [isSaving, startTransition] = useTransition();
  async function submit() {
    startTransition(async () => {
      let _total = total;
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
        orders.push({ amountPaid, id, amountDue, customerId, paymentOption });
      });
      // .filter((f) => (f?.amountPaid || 0) > 0);
      await applyPaymentAction({ orders });
      route.refresh();
      dispatchSlice("applyPayment", null as any);
      toast.message("Payment Applied Succesfully");
    });
  }
  return (
    <BaseModal<ISalesOrder[]>
      className="sm:max-w-[550px]"
      onOpen={(order) => {}}
      onClose={() => {}}
      modalName="salesPayment"
      Title={({ data: orders }) => <div>Apply Payment</div>}
      Content={({ data: orders }) => (
        <div className="grid gap-2">
          <Table className="w-full ">
            <TableHeader>
              <TableRow>
                {orders?.length && <TableHead className=""></TableHead>}
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
          <div className="flex justify-end">
            <Info className="text-end" label="Total">
              $ {total}
            </Info>
          </div>
        </div>
      )}
      Footer={({ data }) => (
        <Btn
          disabled={total == 0}
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
