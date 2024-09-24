"use client";

import React, { useContext, useEffect } from "react";
import { useDykeForm } from "../_hooks/form-context";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { cn, sum } from "@/lib/utils";
import ControlledSelect from "@/components/common/controls/controlled-select";
import salesData from "../../../sales/sales-data";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Label } from "@/components/ui/label";
import Money from "@/components/_v1/money";
import { formatMoney } from "@/lib/use-number";
import "./style.css";
import { TableCol } from "@/components/common/data-table/table-cells";
import { calculateFooterEstimate } from "../footer-estimate";
import salesData2 from "@/app/(clean-code)/(sales)/_common/utils/sales-data";
const defaultValues = {
    taxPercentage: null,
    tax: null,
    grandTotal: null,
    subTotal: null,
    ccc: null,
    orderTax: null,
    floating: false,
};
const ctx = React.createContext(defaultValues);
type CtxKeys = keyof typeof defaultValues;

export default function DykeSalesFooterSection({}) {
    const form = useDykeForm();

    const [
        orderTax,
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
        "order.meta.tax",
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
    const taxes = form.watch(
        salesData2.salesTaxes.map((s) => `taxByCode.${s.code}.tax`) as any
    );

    useEffect(() => {
        const estimate = calculateFooterEstimate(form.getValues(), {
            cccPercentage,
            footerPrices,
            laborCost,
            paymentOption,
            discount,
            orderTax,
        });

        form.setValue("order.meta.ccc", estimate.ccc);
        form.setValue("order.tax", formatMoney(estimate.tax));
        form.setValue("order.subTotal", formatMoney(estimate.subTotal));
        form.setValue("order.grandTotal", estimate.grandTotal);
        estimate.taxes.map((tax) => {
            form.setValue(`taxByCode.${tax.taxCode}.tax` as any, tax.tax);
        });
    }, [footerPrices, paymentOption, laborCost, discount, orderTax]);
    const ctxValue = {
        // footerPrices,
        // laborCost,
        // discount,
        taxPercentage,
        tax,
        ccc,
        // cccPercentage,
        grandTotal,
        orderTax,
        subTotal,
        floating: false,
    } as any;
    salesData2.salesTaxes.map((t, i) => (ctxValue[t.code] = taxes?.[i]));
    return (
        <div className="mb-16">
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
function CustomTableCell({ children }) {
    return (
        <TableCell align="right" className="flex w-full p-1">
            <div className="flex justify-end items-center ">{children}</div>
        </TableCell>
    );
}
function XTableHead({ children }) {
    return <TableHead className="p-1 h-auto">{children}</TableHead>;
}
const Details = {
    PaymentOptions() {
        const form = useDykeForm();
        return (
            <>
                <TableHead className={cn()}>Payment</TableHead>
                <CustomTableCell>
                    <ControlledSelect
                        control={form.control}
                        className={cn("")}
                        onSelect={(e) => {
                            console.log(e);
                        }}
                        name={"order.meta.payment_option"}
                        options={salesData.paymentOptions}
                    />
                </CustomTableCell>
            </>
        );
    },
    Discount() {
        const form = useDykeForm();
        return (
            <>
                <TableHead className={cn()}>Discount</TableHead>
                <CustomTableCell>
                    <ControlledInput
                        type="number"
                        control={form.control}
                        className={cn("")}
                        name={"order.meta.discount"}
                    />
                </CustomTableCell>
            </>
        );
    },
    Labour() {
        const form = useDykeForm();
        return (
            <>
                <TableHead className={cn()}>Labour</TableHead>
                <CustomTableCell>
                    <ControlledInput
                        type="number"
                        control={form.control}
                        className={cn("")}
                        name={"order.meta.labor_cost"}
                    />
                </CustomTableCell>
            </>
        );
    },
    Line({ title, valueKey }: { title?; valueKey: CtxKeys }) {
        const _ctx = useContext(ctx);
        if (_ctx.floating)
            return (
                <TableCell className="p-1">
                    <div className="flex items-center space-x-2">
                        <TableCol.Secondary>{title}</TableCol.Secondary>

                        <Label>
                            <Money value={_ctx?.[valueKey]} />
                        </Label>
                    </div>
                </TableCell>
            );
        return (
            <>
                <XTableHead>{title}</XTableHead>
                <CustomTableCell>
                    <Label>
                        <Money value={_ctx?.[valueKey]} />
                    </Label>
                </CustomTableCell>
            </>
        );
    },
};
function FloatingFooter() {
    const _ctx = useContext(ctx);
    return (
        <div className="fixed bottom-0 left-0  right-0 md:grid smd:grid-cols-[220px_minmax(0,1fr)]  lg:grid-cols-[240px_minmax(0,1fr)] mb-6">
            <div className="hidden  md:block" />
            <div className="lg:gap-10 2xl:grid 2xl:grid-cols-[1fr_300px] mx-2">
                {/* <Footer floatingFooter /> */}
                <div className="flex rounded-lg border bg-white p-1 shadow">
                    <Table>
                        <TableBody>
                            <TableRow>
                                {/* <Details.PaymentOptions />
                                <Details.Labour /> <Details.Discount /> */}
                                <Details.Line
                                    title="Sub Total:"
                                    valueKey="subTotal"
                                />
                                <Details.Line
                                    title={`Tax (${
                                        _ctx.orderTax ? _ctx.taxPercentage : 0
                                    }%):`}
                                    valueKey="tax"
                                />
                                <Details.Line title="C.C.C:" valueKey="ccc" />
                                <Details.Line
                                    title="Total:"
                                    valueKey="grandTotal"
                                />
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
function Footer() {
    const _ctx = useContext(ctx);
    return (
        <div className="flex  justify-end">
            <div className="" id="dykeFooter">
                <Table className=" border rounded">
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
                        {salesData2.salesTaxes?.map((line) => (
                            <TableRow key={line.code}>
                                <Details.Line
                                    title={`${line.title} ${line.percentage}%`}
                                    valueKey={line.code as any}
                                />
                            </TableRow>
                        ))}
                        {/* <TableRow>
                            <Details.Line
                                title={`Tax (${
                                    _ctx.orderTax ? _ctx.taxPercentage : 0
                                }%)`}
                                valueKey="tax"
                            />
                        </TableRow> */}
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
