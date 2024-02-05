"use client";

import React from "react";
import { SalesPrintProps } from "./page";

export type BasePrintProps = SalesPrintProps["searchParams"] & {};
export const SalesPrintCtx = React.createContext<BasePrintProps>(null as any);
export const useSalesPrintCtx = () =>
    React.useContext<BasePrintProps>(SalesPrintCtx);
export function OrderBasePrinter({
    children,
    ...props
}: { children } & SalesPrintProps["searchParams"]) {
    const value: BasePrintProps = {
        ...props,
    };
    return (
        <SalesPrintCtx.Provider value={value}>
            {children}
        </SalesPrintCtx.Provider>
    );
}
