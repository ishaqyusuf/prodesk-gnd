import { SalesFormResponse } from "@/app/(v1)/_actions/sales/sales-form";
import { _getSalesFormAction } from "@/app/(v1)/(auth)/sales/_actions/get-sales-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/_v1/breadcrumbs/links";
import EditSalesForm from "../../components/form";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Edit Sales",
};
export default async function EditSalesPage({ searchParams, params }) {
    const { type, slug } = params;
    const resp: SalesFormResponse = await _getSalesFormAction({
        orderId: slug,
        type,
    });
    let title = [
        `${resp.form.id ? "Edit" : "New"} ${type}`,
        resp.form.id && slug,
    ]
        .filter(Boolean)
        .join(": ");
    // if (!resp.form.deliveryOption) resp.form.deliveryOption = "pickup";
    const orderId = resp?.form?.orderId;
    metadata.title = title;
    return (
        <div id="salesEditPage">
            <Breadcrumbs>
                <OrdersCrumb isFirst />
                {orderId && <OrderViewCrumb slug={orderId} />}
                <BreadLink title={orderId ? "Edit" : "New"} isLast />
            </Breadcrumbs>
            <EditSalesForm data={resp} />
        </div>
    );
}
