import { Info } from "@/app/(auth)/sales/orders/[slug]/cards/order-details";
import applyPayment from "@/app/api/sales-payment/apply-payment";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { ISalesOrder } from "@/types/ISales";
import { deepCopy } from "@/lib/deep-copy";
import { useLoader } from "@/lib/use-loader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Btn from "../form/btn";
import { Checkbox } from "../ui/checkbox";
import { DialogFooter } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import BaseDialog from "./base-dialog";
import { toast } from "sonner";

export function OrderApplyPaymentDialog({}) {
  const items = useAppSelector((state) => state.slicers.applyPayment);
  const [selection, setSelection] = useState<{
    [id in string]: ISalesOrder | undefined;
  }>({});
  const loader = useLoader();
  const route = useRouter();
  const [total, setTotal] = useState(0);
  useEffect(() => {
    let total = 0;
    Object.values<ISalesOrder>(selection).map(
      (v) => v && (total += v.amountDue)
    );
    console.log(selection);
    setTotal(total);
  }, [selection]);
  async function submit() {
    loader.action(async () => {
      let _total = total;
      const orders = Object.values<ISalesOrder | undefined>(selection)
        .map((s) => {
          if (!s) return null;
          let amountPaid = 0;
          let {
            id,
            amountDue,
            customerId,
            meta: { payment_option: paymentOption } = {},
          } = s;
          if (_total >= amountDue) {
            _total -= s.amountDue;
            amountPaid = s.amountDue;
            amountDue -= amountPaid;
          } else if (_total > 0 && amountDue > _total) {
            amountPaid = _total;
            amountDue -= _total;
            _total = 0;
          }
          return { amountPaid, id, amountDue, customerId, paymentOption };
        })
        .filter((f) => f?.amountPaid > 0);
      await applyPayment({ orders });
      route.refresh();
      dispatchSlice("applyPayment", null as any);
      toast.message("Payment Applied Succesfully");
    });
  }

  return (
    <BaseDialog
      title="Apply Payment"
      onOpen={() => {
        let _sel: any = {};
        items.map((item) => (_sel[item.orderId] = deepCopy(item)));
        setSelection(_sel);
      }}
      slicer="applyPayment"
    >
      <div className="grid gap-2">
        <Table className="w-full ">
          <TableHeader>
            <TableRow>
              {items?.length > 1 && <TableHead className=""></TableHead>}
              <TableHead className="">Order</TableHead>
              <TableHead className="text-end">Amount Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                {items.length > 1 && (
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
      <DialogFooter>
        <Btn
          disabled={total == 0}
          isLoading={loader.isLoading}
          onClick={submit}
          size="sm"
          type="submit"
        >
          Apply
        </Btn>
      </DialogFooter>
    </BaseDialog>
  );
}
