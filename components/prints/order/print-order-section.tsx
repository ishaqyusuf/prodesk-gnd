"use client";

import { ISalesOrder } from "@/types/ISales";
import { OrderPrintFooter } from "./order-print-footer";
import { OrderPrintHeader } from "./order-print-header";
import { OrderPrintInvoiceLines } from "./order-print-invoice-lines";
import "@/styles/sales.css";
import { WaterMark } from "./water-mark";
interface Props {
  order: ISalesOrder;
  index: Number;
}
export function PrintOrderSection({ order, index }: Props) {
  //    const { mode } = useAppSelector((state) => state.slicers.printOrders);
  return (
    <div id={`salesPrinter`}>
      <div
        id={`s${order.orderId}`}
        className={`${index == 0 && "print:break-before-page"}`}
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
