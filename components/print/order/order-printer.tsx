"use client";

import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { useEffect } from "react";
import BasePrinter from "../base-printer";
import { useState } from "react";
import { PrintOrderSection } from "./print-order-section";
import { WaterMark } from "./water-mark";
import { adjustWatermark } from "@/lib/adjust-watermark";
import { salesPrintAction } from "@/app/_actions/sales";
import { ISalesOrder } from "@/types/sales";

interface Props {}
export default function OrderPrinter({}: Props) {
  const printer = useAppSelector((state) => state.slicers.printOrders);
  useEffect(() => {
    print(printer);
  }, [printer]);
  const [sales, setSales] = useState<ISalesOrder[]>([]);
  useEffect(() => {
    if (sales?.length > 0) {
      console.log("PRINTING>..");
      adjustWatermark(sales?.map((s) => s.orderId));
      // setTimeout(() => {
      window.print();
      dispatchSlice("printOrders", null);
      // setSales([]);
      // }, 1000);
    }
  }, [sales]);
  async function print(printer: { mode; slugs: string[] }) {
    if (!printer) return;
    const sales = await salesPrintAction({ slugs: printer.slugs });
    setSales(sales as any);
    console.log("PRINT TRIGGEREED");
  }
  return (
    <BasePrinter>
      {sales.map((order, _) => (
        <PrintOrderSection index={_} order={order} key={_} />
      ))}
      <WaterMark />
    </BasePrinter>
  );
}
