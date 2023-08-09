"use client";

import { OrderPrintFooter } from "./order-print-footer";
import { OrderPrintHeader } from "./order-print-header";
import { OrderPrintInvoiceLines } from "./order-print-invoice-lines";
import "@/styles/sales.css";
import { WaterMark } from "./water-mark";
import { ISalesOrder } from "@/types/sales";
import { cn } from "@/lib/utils";
interface Props {
  order: ISalesOrder;
  index: number;
}
export function PrintOrderSection({ order, index }: Props) {
  //    const { mode } = useAppSelector((state) => state.slicers.printOrders);
  return (
    <div id={`salesPrinter`}>
      <div
        id={`s${order.orderId}`}
        className={cn(index > 0 && "print:break-before-page")}
      >
        <table className="report-table mr-10 w-full text-xs">
          <OrderPrintHeader order={order} />
          <OrderPrintInvoiceLines order={order} />
          <OrderPrintFooter order={order} />
        </table>
      </div>
    </div>
  );
}
