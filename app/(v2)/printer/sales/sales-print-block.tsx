"use client";

import React, { useEffect } from "react";
import { getSalesPrintData } from "./get-sales-print-data";
import { usePrintContext } from "../base-printer";
import { cn } from "@/lib/utils";
import SalesPrintHeader from "./components/sales-print-header";
import { BasePrintProps, useSalesPrintCtx } from "./order-base-printer";
import SalesPrintLineItems from "./components/sales-print-line-items";
import SalesPrintShelfItems from "./components/sales-print-shelf-items";
import SalesPrintDoorItems from "./components/sales-print-door-items";
import SalesPrintFooter from "./components/sales-print-footer";

export type SalesPrintData = Awaited<ReturnType<typeof getSalesPrintData>>;
interface Props {
    action: Promise<SalesPrintData>;
    slug;
    className?: string;
}

interface SalesBlockCtxProps extends BasePrintProps {
    sale: SalesPrintData;
}
export const SalesBlockCtx = React.createContext<SalesBlockCtxProps>(
    null as any
);
export const useSalesBlockCtx = () =>
    React.useContext<SalesBlockCtxProps>(SalesBlockCtx);

export default function SalesPrintBlock({ action, slug, className }: Props) {
    const data = React.use(action);
    const ctx = usePrintContext();
    const basePrint = useSalesPrintCtx();
    useEffect(() => {
        if (data) ctx.pageReady(slug, data);
    }, [data]);
    if (!data) return null;
    return (
        <SalesBlockCtx.Provider
            value={{
                sale: data,
                ...basePrint,
            }}
        >
            <div className="" id={`salesPrinter`}>
                <section
                    id={`s${data.order.orderId}`}
                    className={cn(className)}
                >
                    <table className="main mr-10s w-full text-xs table-fixed">
                        <SalesPrintHeader />
                        <tbody>
                            <SalesPrintDoorItems />
                            <SalesPrintShelfItems />
                            <SalesPrintLineItems />
                        </tbody>
                        <SalesPrintFooter />
                    </table>
                </section>
            </div>
        </SalesBlockCtx.Provider>
    );
}
