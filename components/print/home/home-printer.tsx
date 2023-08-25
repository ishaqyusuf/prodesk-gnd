"use client";
import html2pdf from "html2pdf.js";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { useEffect } from "react";
import BasePrinter from "../base-printer";
import { useState } from "react";

import { adjustWatermark } from "@/lib/adjust-watermark";
import { salesPrintAction } from "@/app/_actions/sales/sales";
import { ISalesOrder } from "@/types/sales";

import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import Link from "next/link";
import Image from "next/image";
import { timeout } from "@/lib/timeout";
import "@/styles/sales.css";
import { jsPDF } from "jspdf";
import { ExtendedHome } from "@/types/community";
import { printHomes } from "@/app/_actions/community/home-template";
import { HomeTemplates } from "@prisma/client";
interface Props {}
export default function HomePrinter({}: Props) {
  const printer = useAppSelector((state) => state.slicers.printHomes);
  useEffect(() => {
    print();
  }, [printer]);
  const [homes, setHomes] = useState<
    { home: ExtendedHome; template: HomeTemplates }[]
  >([]);
  //   useEffect(() => {
  //     if (sales?.length > 0) {
  //       adjustWatermark(sales?.map((s) => s.orderId));
  //     }
  //   }, [sales]);

  async function print() {
    if (!printer) return;
    setHomes(printer.homes.map((slug) => ({ slug, loading: true })) as any);
    const _templates = await printHomes(
      printer.homes.map(({ modelName, builderId }) => ({
        modelName,
        builderId: builderId as any,
      }))
    );
    setHomes(
      printer.homes.map((home) => {
        return {
          template: _templates.find(
            (t) =>
              home.builderId == t.builderId && home.modelName == t.modelName
          ),
          home,
        };
      }) as any
    );
    await timeout(900);
    window.print();

    dispatchSlice("printHomes", null);
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
    <BasePrinter id="orderPrintSection">
      {homes.map((order, _) => (
        // <PrintOrderSection index={_} order={order} key={_} />
        <div id={`orderPrinter`} key={_}>
          <div
            id={`s${order.home.id}`}
            className={cn(_ > 0 && "print:break-before-page")}
          ></div>
        </div>
      ))}
    </BasePrinter>
  );
}
