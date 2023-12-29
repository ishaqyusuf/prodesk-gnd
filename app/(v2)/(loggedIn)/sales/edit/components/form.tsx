"use client";

import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import { Form } from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import InvoiceTable from "./invoice-table";
import { SalesFormContext } from "../ctx";
import { ISalesForm } from "../type";
import { useState } from "react";
import salesFormUtils from "../sales-form-utils";
import InvoiceItemsSelection from "./selection-action";
import useItemSelection from "../hooks/use-item-selection";
import SalesFormAction from "./sales-form-action";
import SalesDetailsSection from "./sales-details-section";
import SalesAddressSection from "./sales-address-section";
import RenderForm from "@/_v2/components/common/render-form";

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
    const itemSelector = useItemSelection();

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
        type,
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
        "type",
    ]);
    const [summary, setSummary] = useState({});
    const [toggleMockup, setToggleMockup] = useState(false);
    renderCount++;
    return (
        <FormProvider {...form}>
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
                    itemSelector,
                    setToggleMockup,
                    isOrder: type == "order",
                }}
            >
                <RenderForm {...form}>
                    <p></p>
                    <div className="px-8">
                        <section id="action">
                            <SalesFormAction />
                        </section>
                        <section
                            id="detailsSection"
                            className="border-y my-2 py-1 grid gap-4 md:grid-cols-2 xl:grid-cols-5 gap-x-8"
                        >
                            <SalesDetailsSection />
                            <SalesAddressSection />
                        </section>
                        <section id="invoiceForm">
                            <InvoiceTable />
                        </section>
                    </div>
                </RenderForm>
                <InvoiceItemsSelection />
            </SalesFormContext.Provider>
        </FormProvider>
    );
}
