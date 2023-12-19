import {
    SalesFormResponse,
    salesFormAction,
} from "@/app/_actions/sales/sales-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
    BreadLink,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/breadcrumbs/links";
import SalesForm from "@/app/(auth)/sales/order/[slug]/form/components/sales-form";
import SalesSupplySheet from "@/components/sheets/sales-supply-sheet";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";
import { _getSalesFormAction } from "../../../_actions/get-sales-form";

export const metadata: Metadata = {
    title: "Edit Invoice",
    description: "",
};

export default async function OrderFormPage({
    searchParams,
    params: { slug },
}) {
    const resp: SalesFormResponse = await _getSalesFormAction({
        orderId: slug,
        type: "order",
    });
    // console.log(resp.ctx?.items?.length);
    if (!resp.form.deliveryOption) resp.form.deliveryOption = "pickup";
    const orderId = resp?.form?.orderId;
    return (
        <DataPageShell data={resp}>
            <Breadcrumbs>
                <OrdersCrumb isFirst />
                {orderId && <OrderViewCrumb slug={orderId} />}
                <BreadLink title={orderId ? "Edit" : "New"} isLast />
            </Breadcrumbs>
            <SalesForm newTitle="New Order" slug={slug} data={resp}></SalesForm>
            <SalesSupplySheet />
        </DataPageShell>
    );
}
