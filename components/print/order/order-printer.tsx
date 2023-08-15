"use client";

import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { useEffect } from "react";
import BasePrinter from "../base-printer";
import { useState } from "react";
import { WaterMark } from "./water-mark";
import { adjustWatermark } from "@/lib/adjust-watermark";
import { salesPrintAction } from "@/app/_actions/sales/sales";
import { ISalesOrder } from "@/types/sales";
import { OrderPrintHeader } from "./order-print-header";
import { OrderPrintInvoiceLines } from "./order-print-invoice-lines";
import { OrderPrintFooter } from "./order-print-footer";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import Link from "next/link";
import Image from "next/image";
import { timeout } from "@/lib/timeout";
import "@/styles/sales.css";

interface Props {}
export default function OrderPrinter({}: Props) {
  const printer = useAppSelector((state) => state.slicers.printOrders);
  useEffect(() => {
    print(printer);
  }, [printer]);
  const [sales, setSales] = useState<ISalesOrder[]>([]);
  useEffect(() => {
    if (sales?.length > 0) {
      adjustWatermark(sales?.map((s) => s.orderId));
    }
  }, [sales]);

  async function print(printer: { mode; slugs: string[] }) {
    if (!printer) return;
    setSales(printer.slugs.map((slug) => ({ slug, loading: true })) as any);
    const _sales = await salesPrintAction({ slugs: printer.slugs });
    setSales(_sales as any);
    await timeout(900);
    adjustWatermark(sales?.map((s) => s.orderId));
    console.log(sales);
    // await timeout(800);
    window.print();
    // await timeout(200);
    dispatchSlice("printOrders", null);
  }
  const Logo = ({}) => (
    <Link href="/">
      <Image
        alt=""
        onLoadingComplete={(img) => {
          console.log("LOGO READY");
        }}
        width={178}
        height={80}
        src={logo}
      />
    </Link>
  );
  return (
    <BasePrinter>
      {sales.map((order, _) => (
        // <PrintOrderSection index={_} order={order} key={_} />
        <div id={`salesPrinter`} key={_}>
          <div
            id={`s${order.orderId}`}
            className={cn(_ > 0 && "print:break-before-page")}
          >
            <table className="report-table mr-10s w-full text-xs">
              <OrderPrintHeader Logo={Logo} order={order} />
              {order.id && (
                <>
                  <OrderPrintInvoiceLines order={order} />
                  <OrderPrintFooter order={order} />
                </>
              )}
            </table>
          </div>
        </div>
      ))}
      <WaterMark />
    </BasePrinter>
  );
}
