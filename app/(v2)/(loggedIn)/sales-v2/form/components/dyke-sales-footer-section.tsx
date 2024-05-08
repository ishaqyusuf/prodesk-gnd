"use client";

import React, { useEffect } from "react";
import { useDykeForm } from "../_hooks/form-context";

const ctx = React.createContext({} as any);

export default function DykeSalesFooterSection({}) {
    const form = useDykeForm();

    const [
        footerPrices,
        laborCost,
        discount,
        taxPercentage,
        tax,
        ccc,
        cccPercentage,
        grandTotal,
        subTotal,
    ] = form.watch([
        "footer.footerPrices",
        "order.meta.labor_cost",
        "order.meta.discount",
        "order.taxPercentage",
        "order.tax",
        "order.meta.ccc",
        "order.meta.ccc_percentage",
        "order.grandTotal",
        "order.subTotal",
    ]);

    useEffect(() => {
        // console.log(footerPrices);
    }, [footerPrices]);
    const ctxValue = {
        footerPrices,
        laborCost,
        discount,
        taxPercentage,
        tax,
        ccc,
        cccPercentage,
        grandTotal,
        subTotal,
        floating: false,
    };
    return (
        <div className="">
            <ctx.Provider
                value={{
                    ...ctxValue,
                }}
            >
                <Footer />
            </ctx.Provider>
            <ctx.Provider
                value={{
                    ...ctxValue,
                    floating: true,
                }}
            >
                <FloatingFooter />
            </ctx.Provider>
        </div>
    );
}
function Footer() {
    return <></>;
}
function FloatingFooter() {
    return <></>;
}
