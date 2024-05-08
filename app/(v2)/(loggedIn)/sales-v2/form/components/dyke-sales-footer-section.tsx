"use client";

import React, { useContext, useEffect } from "react";
import { useDykeForm } from "../_hooks/form-context";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ControlledSelect from "@/components/common/controls/controlled-select";
import salesData from "../../../sales/sales-data";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Label } from "@/components/ui/label";
import Money from "@/components/_v1/money";

const defaultValues = {
    taxPercentage: null,
    tax: null,
    grandTotal: null,
    subTotal: null,
    ccc: null,
    floating: false,
};
const ctx = React.createContext(defaultValues);
type CtxKeys = keyof typeof defaultValues;

export default function DykeSalesFooterSection({}) {
    const form = useDykeForm();

    const [
        footerPrices,
        laborCost,
        discount,
        taxPercentage,
        tax,
        ccc,
        paymentOption,
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
        "order.meta.payment_option",
        "order.meta.ccc_percentage",
        "order.grandTotal",
        "order.subTotal",
    ]);
    useEffect(() => {}, [footerPrices, paymentOption, laborCost, discount]);
    const ctxValue = {
        // footerPrices,
        // laborCost,
        // discount,
        taxPercentage,
        tax,
        ccc,
        // cccPercentage,
        grandTotal,
        subTotal,
        floating: false,
    } as any;
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
const Details = {
    PaymentOptions() {
        const form = useDykeForm();
        return (
            <>
                <TableCell className={cn()}>Payment Option</TableCell>
                <TableCell>
                    <ControlledSelect
                        control={form.control}
                        className={cn("w-[200px]")}
                        onSelect={(e) => {
                            console.log(e);
                        }}
                        name={"order.meta.payment_option"}
                        options={salesData.paymentOptions}
                    />
                </TableCell>
            </>
        );
    },
    Discount() {
        const form = useDykeForm();
        return (
            <>
                <TableCell className={cn()}>Discount</TableCell>
                <TableCell>
                    <ControlledInput
                        type="number"
                        control={form.control}
                        className={cn("w-[200px]")}
                        name={"order.meta.discount"}
                    />
                </TableCell>
            </>
        );
    },
    Labour() {
        const form = useDykeForm();
        return (
            <>
                <TableCell className={cn()}>Labour</TableCell>
                <TableCell>
                    <ControlledInput
                        type="number"
                        control={form.control}
                        className={cn("w-[200px]")}
                        name={"order.meta.labor_cost"}
                    />
                </TableCell>
            </>
        );
    },
    Line({ title, valueKey }: { title?; valueKey: CtxKeys }) {
        const _ctx = useContext(ctx);
        return (
            <>
                <TableCell className={cn()}>{title}</TableCell>
                <TableCell>
                    <Label>
                        <Money value={_ctx?.[valueKey]} />
                    </Label>
                </TableCell>
            </>
        );
    },
};
function Footer() {
    return <></>;
}
function FloatingFooter() {
    return (
        <div className="flex  justify-end">
            <div>
                <Table className="w-[200px]">
                    <TableBody>
                        <TableRow>
                            <Details.PaymentOptions />
                        </TableRow>
                        <TableRow>
                            <Details.Labour />
                        </TableRow>
                        <TableRow>
                            <Details.Discount />
                        </TableRow>
                        <TableRow>
                            <Details.Line
                                title="Sub Total"
                                valueKey="subTotal"
                            />
                        </TableRow>
                        <TableRow>
                            <Details.Line title="Tax" valueKey="tax" />
                        </TableRow>
                        <TableRow>
                            <Details.Line title="C.C.C" valueKey="ccc" />
                        </TableRow>
                        <TableRow>
                            <Details.Line title="Total" valueKey="grandTotal" />
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
