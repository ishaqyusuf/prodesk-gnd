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

import {
  cn,
  designDotToObject,
  dotArray,
  removeEmptyValues,
} from "@/lib/utils";
import logo from "@/public/logo.png";
import Link from "next/link";
import Image from "next/image";
import { timeout } from "@/lib/timeout";
import "@/styles/sales.css";
import { jsPDF } from "jspdf";
import {
  CommunityTemplateDesign,
  ExtendedHome,
  HomeTemplateDesign,
  ICommunityTemplate,
  IHome,
  IHomeTemplate,
} from "@/types/community";
import { printHomesAction } from "@/app/_actions/community/home-template";
import { HomeTemplates } from "@prisma/client";
import HomePrintData from "./home-print-data";
import { openModal } from "@/lib/modal";
import { getHomeProductionStatus } from "@/lib/community/community-utils";
import { toast } from "sonner";
interface Props {}
export default function HomePrinter({}: Props) {
  const printer = useAppSelector((state) => state.slicers.printHomes);
  useEffect(() => {
    print();
  }, [printer]);
  const [homes, setHomes] = useState<
    { home: ExtendedHome; design: HomeTemplateDesign }[]
  >([]);
  //   useEffect(() => {
  //     if (sales?.length > 0) {
  //       adjustWatermark(sales?.map((s) => s.orderId));
  //     }
  //   }, [sales]);

  async function print() {
    if (!printer) return;
    // setHomes(printer.homes.map((slug) => ({ slug, loading: true })) as any);
    const {
      prints: _templates,
      communityPrints,
    }: {
      prints: IHomeTemplate[];
      communityPrints: ICommunityTemplate[];
    } = (await printHomesAction(
      printer.homes.map(({ modelName, builderId, projectId }) => ({
        modelName,
        projectId,
        builderId: builderId as any,
      }))
    )) as any;
    setHomes(
      printer.homes.map((home) => {
        const template = dotArray(
          _templates.find(
            (t) =>
              home.builderId == t.builderId && home.modelName == t.modelName
          )?.meta?.design
        );
        // template?.bifoldDoor.bifoldOther1.
        const community = dotArray(
          communityPrints.find(
            (ct) =>
              ct.projectId == home.projectId && ct.modelName == home.modelName
          )?.meta?.design
        );

        Object.entries(community).map(([k, v]) => {
          const spl = k.split(".");
          const ls = spl.splice(-1)[0];
          if (ls == "c" && v)
            template[spl.join(".")] = community[`${spl.join(".")}.v`];
        });
        const dotDesign = removeEmptyValues(template);
        const design: HomeTemplateDesign = designDotToObject(dotDesign) as any;
        design.project = {
          projectName: home?.project?.title,
          builder: home?.project?.builder?.name,
          modelName: home?.modelName,
          lot: home?.lot,
          block: home?.block,
          address: home.project?.address,
          deadbolt: design?.lockHardware?.deadbolt,
        };
        return {
          design,
          dotDesign,
          home,
        };
      })
    );
    await timeout(900);
    window.print();
    const _homes = printer.homes;
    const actProd = _homes.filter(
      (h) => getHomeProductionStatus(h).productionStatus == "Idle"
    );
    console.log(actProd);
    if (actProd.length) openModal("activateProduction", printer.homes);
    else {
      toast.success("Units are already in production.");
    }
    dispatchSlice("printHomes", null);
  }
  const Logo = ({}) => (
    <Link href="/">
      <Image
        alt=""
        onLoadingComplete={(img) => {
          // console.log("LOGO READY");
        }}
        width={178}
        height={80}
        src={logo}
      />
    </Link>
  );
  return (
    <BasePrinter id="orderPrintSection">
      {homes.map((xhome, _) => (
        // <PrintOrderSection index={_} order={order} key={_} />
        <div id={`orderPrinter`} key={_}>
          <div
            id={`s${xhome.home?.id}`}
            className={cn(_ > 0 && "print:break-before-page")}
          >
            <HomePrintData {...xhome} />
          </div>
        </div>
      ))}
    </BasePrinter>
  );
}
