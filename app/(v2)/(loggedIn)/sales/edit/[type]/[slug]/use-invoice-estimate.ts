import { ISalesOrder } from "@/types/sales";
import { useContext, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { SalesFormContext } from "./ctx";
import { convertToNumber, toFixed } from "@/lib/use-number";
import { addPercentage } from "@/lib/utils";
import { ISalesForm } from "./type";

export function useInvoiceLineEstimate(index, qty, unitPrice, taxxable, lid) {
    const form = useFormContext<ISalesOrder>();
    const {
        data,
        profileEstimate,
        profitRate,
        mockupPercentage,
        toggleMockup,
        taxPercentage,
        setSummary,
    } = useContext(SalesFormContext);

    useEffect(() => {
        console.log([qty, unitPrice]);
        let _rate =
            (profitRate && profileEstimate
                ? +toFixed(Number(unitPrice) / Number(profitRate || 1))
                : unitPrice) || 0;
        if (toggleMockup) _rate = addPercentage(_rate, mockupPercentage);
        form.setValue(`items.${index}.rate`, _rate);
        const total = +toFixed(convertToNumber(qty * _rate, 0)) || 0;
        form.setValue(`items.${index}.total`, +total);
        let lineTax = 0;
        if (taxxable && total && taxPercentage) {
            lineTax = +toFixed(total * ((taxPercentage || 0) / 100));
        }
        form.setValue(`items.${index}.tax`, +toFixed(lineTax));
        const ls = {
            tax: lineTax,
            total,
            id: lid,
        };
        setSummary((old) => ({
            ...old,
            [lid]: ls,
        }));

        // Object.entries(ls).map(([k, v]) =>
        //     form.setValue(`_lineSummary.${lid}.${k}` as any, v)
        // );
        // console.log(ls);
    }, [
        qty,
        lid,
        unitPrice,
        taxxable,
        profileEstimate,
        profitRate,
        mockupPercentage,
        toggleMockup,
        index,
    ]);
}

export function useInvoiceTotalEstimate() {
    const {
        summary,
        data,
        discount,
        paymentOption,
        taxPercentage,
        labourCost,
    } = useContext(SalesFormContext);
    const cccP = data?.ctx?.settings?.ccc;
    const form = useFormContext<ISalesForm>();

    useEffect(() => {
        let tax = 0;
        let subTotal = 0;
        Object.entries(summary).map(([uid, item]: [uid: string, item: any]) => {
            tax += item.tax;
            subTotal += item.total;
        });
        let total = subTotal + (+labourCost || 0) - (+discount || 0);
        let ccc = 0;
        if (paymentOption == "Credit Card" && cccP)
            ccc = +toFixed((cccP / 100) * (total + tax)) || 0;
        Object.entries({
            subTotal: +toFixed(subTotal),
            tax: +toFixed(tax),
            "meta.ccc": ccc,
            "meta.ccc_percentage": +cccP,
            grandTotal: +toFixed(ccc + tax + total),
        }).map(([k, v]) => form.setValue(k as any, v));
    }, [summary, discount, paymentOption, labourCost, taxPercentage, cccP]);
}
