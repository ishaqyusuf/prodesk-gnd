"use client";

import { salesPrintAction } from "@/app/actions/sales/sales";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { useEffect } from "react";
import BasePrinter from "../base-printer";
import { useState } from "react";
import { PrintOrderSection } from "./print-order-section";
import { adjustWatermark } from "@/lib/sales/adjust-watermark";
import { WaterMark } from "./water-mark";

interface Props {}
export default function OrderPrinter({}: Props) {
  const printer = useAppSelector((state) => state.slicers.printOrders);
  useEffect(() => {
    print(printer);
  }, [printer]);
  const [sales, setSales] = useState([]);
  useEffect(() => {
    if (sales?.length > 0) {
      adjustWatermark(sales?.map((s) => s.orderId));
      setTimeout(() => {
        window.print();
        dispatchSlice("printOrders", null);
      }, 1000);
    }
  }, [sales]);
  async function print(printer: { mode; slugs: string[] }) {
    if (!printer) return;
    console.log(printer);
    const sales = await salesPrintAction({ slugs: printer.slugs });
    console.log(sales);
    setSales(sales);
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
