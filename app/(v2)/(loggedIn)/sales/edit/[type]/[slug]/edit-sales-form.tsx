"use client";

import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import salesUtils from "@/app/(auth)/sales/order/[slug]/form/sales-utils";
import { Form } from "@/components/ui/form";
import { ISalesOrder } from "@/types/sales";
import { FormProvider, useForm } from "react-hook-form";
import InvoiceTable from "./invoice-table";
import { SalesFormContext } from "./ctx";
import { ISalesForm } from "./type";
import { useState } from "react";
import salesFormUtils from "./sales-form-utils";

interface Props {
    data: SalesFormResponse;
    newTitle?;
    slug?;
}
let renderCount = 0;
export default function EditSalesForm({ data }: Props) {
    const _formData: any = data?.form || { meta: {} };
    const { _items, footer } = salesFormUtils.initInvoiceItems(
        data?.form?.items
    );
    const defaultValues: ISalesForm = {
        ..._formData,
        items: _items,
    };
    defaultValues._lineSummary = {};
    const form = useForm<ISalesForm>({
        defaultValues,
    });
    const [
        profileEstimate,
        profitRate,
        mockupPercentage,
        taxPercentage,
        discount,
        paymentOption,
        labourCost,
        tax,
        grandTotal,
        cccPercentage,
        ccc,
        subTotal,
    ] = form.watch([
        "meta.profileEstimate",
        "meta.sales_percentage",
        "meta.mockupPercentage",
        "taxPercentage",
        "meta.discount",
        "meta.payment_option",
        "meta.labor_cost",
        "tax",
        "grandTotal",
        "meta.ccc_percentage",
        "meta.ccc",
        "subTotal",
    ]);
    const [summary, setSummary] = useState({});
    const [toggleMockup, setToggleMockup] = useState(false);
    renderCount++;
    return (
        <FormProvider {...form}>
            <span className="counter">Render Count: {renderCount}</span>
            <SalesFormContext.Provider
                value={{
                    data,
                    profileEstimate,
                    profitRate,
                    mockupPercentage,
                    toggleMockup,
                    taxPercentage,
                    setSummary,
                    summary,
                    discount,
                    paymentOption,
                    labourCost,
                    tax,
                    grandTotal,
                    cccPercentage,
                    ccc,
                    subTotal,
                }}
            >
                <Form {...form}>
                    <div className="px-8">
                        <section id="detailsSection" className=""></section>
                        <section id="invoiceForm">
                            <InvoiceTable />
                        </section>
                    </div>
                </Form>
            </SalesFormContext.Provider>
        </FormProvider>
    );
}
