"use client";

import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import salesUtils from "@/app/(auth)/sales/order/[slug]/form/sales-utils";
import { Form } from "@/components/ui/form";
import { ISalesOrder } from "@/types/sales";
import { FormProvider, useForm } from "react-hook-form";
import InvoiceTable from "./invoice-table";
import { SalesFormContext } from "./ctx";

interface Props {
    data: SalesFormResponse;
    newTitle?;
    slug?;
}
let renderCount = 0;
export default function EditSalesForm({ data }: Props) {
    const _formData: any = data?.form || { meta: {} };
    const { _items, footer } = salesUtils.initInvoiceItems(data?.form?.items);
    const defaultValues: ISalesOrder = {
        ..._formData,
        items: _items,
    };
    const form = useForm<ISalesOrder>({
        defaultValues,
    });
    const [profileEstimate, profitRate, mockupPercentage] = form.watch([
        "meta.profileEstimate",
        "meta.sales_percentage",
        "meta.mockupPercentage",
    ]);
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
                }}
            >
                <Form {...form}>
                    <section id="detailsSection" className="px-8"></section>
                    <section id="invoiceForm">
                        <InvoiceTable />
                    </section>
                </Form>
            </SalesFormContext.Provider>
        </FormProvider>
    );
}
