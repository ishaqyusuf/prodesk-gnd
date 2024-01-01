import {
    SalesFormResponse,
    salesFormAction,
} from "@/app/(v1)/_actions/sales/sales-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    EstimatesCrumb,
    OrdersCrumb,
} from "@/components/_v1/breadcrumbs/links";
import SalesForm from "@/app/(v1)/(auth)/sales/order/[slug]/form/components/sales-form";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Invoice",
    description: "",
};

export default async function OrderFormPage({
    searchParams,
    params: { slug },
}) {
    const resp: SalesFormResponse = await salesFormAction({
        orderId: slug,
        type: "estimate",
    });
    const orderId = resp?.form?.orderId;
    return (
        <DataPageShell data={resp}>
            <Breadcrumbs>
                <EstimatesCrumb isFirst />
                {orderId && (
                    <BreadLink
                        title={orderId}
                        link={`/sales/estimate/${orderId}`}
                        slug={orderId}
                    />
                )}
                <BreadLink title={orderId ? "Edit" : "New"} isLast />
            </Breadcrumbs>
            <SalesForm
                newTitle="New Estimate"
                slug={slug}
                data={resp}
            ></SalesForm>
        </DataPageShell>
        // <SalesForm newTitle="New Estimate" slug={slug} data={resp}></SalesForm>
    );
}
