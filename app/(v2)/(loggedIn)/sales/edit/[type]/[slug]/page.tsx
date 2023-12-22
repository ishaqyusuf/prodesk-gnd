import { SalesFormResponse } from "@/app/_actions/sales/sales-form";
import EditSalesForm from "./edit-sales-form";
import { _getSalesFormAction } from "@/app/(auth)/sales/_actions/get-sales-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
    BreadLink,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/breadcrumbs/links";

export default async function EditSalesPage({ searchParams, params }) {
    const { type, slug } = params;
    const resp: SalesFormResponse = await _getSalesFormAction({
        orderId: slug,
        type,
    });
    if (!resp.form.deliveryOption) resp.form.deliveryOption = "pickup";
    const orderId = resp?.form?.orderId;
    return (
        <div>
            <Breadcrumbs>
                <OrdersCrumb isFirst />
                {orderId && <OrderViewCrumb slug={orderId} />}
                <BreadLink title={orderId ? "Edit" : "New"} isLast />
            </Breadcrumbs>
            <EditSalesForm data={resp} />
        </div>
    );
}
