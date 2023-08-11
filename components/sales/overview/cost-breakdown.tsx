"use client";

import { fixPaymentAction } from "@/app/_actions/sales-payment";
import Btn from "@/components/btn";
import Money from "@/components/money";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { keyValue } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function CostBreakdown() {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  let paidReceipt = 0;
  order?.payments?.map((p) => (paidReceipt += p?.amount || 0));
  let pendingPayment = (order.grandTotal || 0) - paidReceipt;
  let offsetPayment = Math.round(pendingPayment - (order?.amountDue || 0));
  const data = [
    keyValue("Payment Option", order?.meta?.payment_option),
    keyValue("Labour", <Money value={order?.meta?.labor_cost} />),
    keyValue("Sub Total", <Money value={order?.subTotal} />),
    keyValue(
      `Tax (${order?.taxPercentage || 0}%)`,
      <Money value={order?.tax} />
    ),
    keyValue(
      `C.C.C (${order?.meta?.ccc_percentage}%)`,
      <Money value={order?.meta?.ccc || 0} />
    ),
    keyValue(`Total`, <Money value={order?.grandTotal} />),
    keyValue(
      `Paid`,
      <Money value={(order.grandTotal || 0) - (order.amountDue || 0)} />
    ),
    keyValue(`Pending`, <Money value={order.amountDue || 0} />),
  ];
  const [isPending, startTransaction] = useTransition();
  const router = useRouter();
  async function fixPayment() {
    startTransaction(async () => {
      await fixPaymentAction({
        amountDue: +pendingPayment,
        id: order.id,
      });
      toast.success("Fixed!");
      router.refresh();
    });
  }
  return (
    <div className="col-span-1">
      <Card>
        <CardContent className="bg-gray-100">
          <Table>
            <TableBody>
              {data.map((line, index) => (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground font-bold p-1">
                    {line.key}
                  </TableCell>
                  <TableCell className="p-1.5">{line.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {offsetPayment != 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-red-500 text-sm font-semibold">
                Due amount does not correspond with the payment history
              </p>
              <Btn
                onClick={fixPayment}
                isLoading={isPending}
                className="w-full h-8"
              >
                Fix
              </Btn>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
