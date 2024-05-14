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
    useEffect(() => {
        let footr = form.getValues("footer.footerPricesJson");
        footr = JSON.parse(footerPrices);
        console.log(footr);
        const items = form.getValues("itemArray");
        let subTotal = 0;
        let tax = 0;
        let taxxable = 0;
        function calculate(uid) {
            let f = footr[uid];
            if (!f) return;
            if (!f.price) f.price = 0;
            console.log(f);

            subTotal += f.price;
            if (orderTax && (f?.tax || f?.doorType != "Services")) {
                const iTax = ((taxPercentage || 0) / 100) * f.price;
                tax += iTax; //f?.price || 0;
                taxxable += f.price;
                // console.log(tax)
            }
        }
        items.map((item) => {
            if (item.multiComponent)
                Object.values(item.multiComponent.components)
                    .filter(Boolean)
                    .map((v) => {
                        calculate(v.uid);
                    });

            // if(item.item.shelfItemArray)
            item.item.shelfItemArray?.map((shelfItem) => {
                calculate(shelfItem.uid);
            });
        });
        tax = formatMoney(tax);

        let total = formatMoney(sum([subTotal, laborCost]));
        let ccc = 0;
        const cccP = Number(cccPercentage || 0);
        // console.log(cccP);

        if (paymentOption == "Credit Card") {
            // console.log(cccP);

            ccc = formatMoney((cccP / 100) * (total + tax));
            // console.log(ccc, [total + tax]);
        }
        console.log(ccc);

        form.setValue("order.meta.ccc", ccc);
        form.setValue("order.tax", formatMoney(tax));
        form.setValue("order.subTotal", formatMoney(subTotal));
        form.setValue(
            "order.grandTotal",
            formatMoney(tax + ccc + total - (discount || 0))
        );
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
        <TableCell align="right" className="flex w-full">
            <div className="flex justify-end items-center ">{children}</div>
        </TableCell>
    );
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
        return (
            <>
                <TableHead className={cn()}>{title}</TableHead>
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
        <div className="fixed bottom-0 left-0  right-0 md:grid md:grid-cols-[220px_minmax(0,1fr)]  lg:grid-cols-[240px_minmax(0,1fr)] mb-6">
            <div className="hidden  md:block" />
            <div className="lg:gap-10 2xl:grid 2xl:grid-cols-[1fr_300px] mx-2">
                {/* <Footer floatingFooter /> */}
                <div className="flex rounded-lg border bg-white p-2 shadow">
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
                        <TableRow>
                            <Details.Line
                                title={`Tax (${
                                    _ctx.orderTax ? _ctx.taxPercentage : 0
                                }%)`}
                                valueKey="tax"
                            />
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
