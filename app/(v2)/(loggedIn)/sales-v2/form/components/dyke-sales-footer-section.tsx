"use client";

import React, { useContext, useEffect } from "react";
import { useDykeForm } from "../_hooks/form-context";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn, sum } from "@/lib/utils";
import ControlledSelect from "@/components/common/controls/controlled-select";
import salesData from "../../../sales/sales-data";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Label } from "@/components/ui/label";
import Money from "@/components/_v1/money";
import { formatMoney } from "@/lib/use-number";

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
        // console.log(footr);
        const items = form.getValues("itemArray");
        let subTotal = 0;
        let tax = 0;
        let taxxable = 0;
        items.map((item) => {
            if (item.multiComponent)
                Object.values(item.multiComponent.components)
                    .filter(Boolean)
                    .map((v) => {
                        console.log(v);

                        let f = footr[v.uid];
                        if (!f) return;
                        if (!f.price) f.price = 0;
                        subTotal += f.price;
                        if (orderTax && (f?.tax || f?.doorType != "Services")) {
                            const iTax = ((taxPercentage || 0) / 100) * f.price;
                            tax += iTax; //f?.price || 0;
                            taxxable += f.price;
                        }
                    });

            // if(item.item.shelfItemArray)
            item.item.shelfItemArray?.map((shelfItem) => {
                // shelfItem.uid
            });
        });
        tax = formatMoney(tax);
        console.log({ taxxable, tax });

        let total = formatMoney(sum([subTotal, laborCost]));
        let ccc = 0;
        const cccP = Number(cccPercentage || 0);
        if (paymentOption == "Credit Card") {
            console.log(cccP);

            ccc = formatMoney((cccP / 100) * (total + tax));
        }

        form.setValue("order.meta.ccc", formatMoney(ccc));
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
    const _ctx = useContext(ctx);
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
