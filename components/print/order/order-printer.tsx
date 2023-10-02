"use client";
import html2pdf from "html2pdf.js";
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
import { addPercentage, cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import Link from "next/link";
import Image from "next/image";
import { timeout } from "@/lib/timeout";
import "@/styles/sales.css";
import { jsPDF } from "jspdf";
import { printSalesPdf } from "@/app/_actions/sales/save-pdf";
import { createPortal } from "react-dom";
interface Props {
    preview?;
    mode?;
    mockup?;
    id?;
}
export default function OrderPrinter({
    preview,

    id,
    mockup,
    mode
}: Props) {
    const printer = useAppSelector(state => state.slicers.printOrders);
    useEffect(() => {
        print();
    }, [printer]);
    useEffect(() => {
        if (id) {
            dispatchSlice("printOrders", {
                mode,
                // pdf: props.pdf,
                mockup,
                ids: Array.isArray(id) ? id : [id],
                isClient: !["production", "packing list"].includes(mode),
                showInvoice: ["order", "quote", "invoice"].includes(mode),
                packingList: mode == "packing list",
                isProd: mode == "production"
            });
        }
    }, [preview, id, mode]);
    const [sales, setSales] = useState<ISalesOrder[]>([]);
    useEffect(() => {
        if (sales?.length > 0) {
            adjustWatermark(sales?.map(s => s.orderId));
        }
    }, [sales]);

    async function print() {
        if (!printer) return;
        setSales(printer.ids.map(slug => ({ slug, loading: true })) as any);
        const _sales: ISalesOrder[] = (await salesPrintAction({
            ids: printer.ids,
            printMode: printer.mode
        })) as any;
        const mockup = printer.mockup;
        setSales(
            _sales.map(sale => {
                const mockPercentage = sale.meta.mockupPercentage;
                if (mockup && mockPercentage > 0) {
                    sale.items = sale.items?.map(item => {
                        item.rate = addPercentage(item.rate, mockPercentage);
                        item.total = addPercentage(item.total, mockPercentage);
                        return item;
                    });

                    sale.tax = addPercentage(sale.tax, mockPercentage);
                    sale.subTotal = addPercentage(
                        sale.subTotal,
                        mockPercentage
                    );
                    sale.meta.ccc = addPercentage(
                        sale.meta.ccc,
                        mockPercentage
                    );
                    sale.grandTotal = addPercentage(
                        sale.grandTotal,
                        mockPercentage
                    );
                }
                return sale;
            }) as any
        );
        await timeout(900);
        adjustWatermark(sales?.map(s => s.orderId));

        // await timeout(800);
        if (!printer.pdf) {
            if (!id) window.print();
        } else {
            //
            // const doc = document.documentElement.outerHTML;
            const dataUri = await printSalesPdf();
            console.log("DOWNLOAD PDF");
            // console.log(durl);
            const link = document.createElement("a");
            link.href = dataUri;
            link.download = "file.pdf";
            // document.body.appendChild(link);
            link.click();
            // document.body.removeChild(link);
            return;
            // console.log(doc);
            // console.log(durl);
            // return;
            // await timeout(5000);
            // const mainDoc = document.getElementById("orderPrintSection");
            // if (mainDoc) {
            //     // const doc = document.getElementById("orderPrintSection")?.cloneNode();
            //     const doc = document.createElement("div");
            //     doc.innerHTML = mainDoc.innerHTML;
            //     doc?.classList?.remove("hidden");
            //     const filename = `${_sales.map(s => s.orderId).join("-")} ${
            //         printer.mode
            //     }.pdf`;
            //     const options = {
            //         // margin: 20

            //         margin: 10, //[10, 10, 10, 10], //top, lef
            //         // margin: [15, 0, 15, 0],
            //         filename, //: 'document.pdf',
            //         // pagebreak: { avoid: ["tr", "td"] },
            //         pagebreak: {
            //             mode: ["avoid-all", "css", "legacy"]
            //         },
            //         // jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' },
            //         jsPDF: {
            //             unit: "mm",
            //             format: "a4",
            //             orientation: "portrait"
            //         },
            //         image: { type: "jpeg", quality: 1 },
            //         html2canvas: {
            //             dpi: 192,
            //             scale: 4,
            //             letterRendering: true,
            //             useCORS: true
            //         }
            //     };
            // const pdf = await html2pdf()
            //   .from(doc)
            //   .set(options)
            //   .outputPDF('');
            // html2pdf()
            //     .set(options)
            //     .from(doc)
            //     .toPdf()
            //     .save(filename);
            // doc?.classList?.add("hidden");
            // }
            // .output("blob");
            // pdf.save();
        }
        // await timeout(200);
        if (!id) dispatchSlice("printOrders", null);
    }
    const Logo = ({}) => (
        <Link href="/">
            <Image
                alt=""
                onLoadingComplete={img => {}}
                width={178}
                height={80}
                src={logo}
            />
        </Link>
    );
    function PrintData() {
        return (
            <>
                {sales.map((order, _) => (
                    // <PrintOrderSection index={_} order={order} key={_} />
                    <div id={`salesPrinter`} key={_}>
                        <div
                            id={`s${order.orderId}`}
                            className={cn(_ > 0 && "break-before-page", "")}
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
            </>
        );
    }
    return id ? (
        createPortal(<PrintData />, document.body)
    ) : (
        <BasePrinter preview={id != null} id="orderPrintSection">
            <PrintData />
        </BasePrinter>
    );
}
