import { SalesFormResponse } from "@/app/(v1)/_actions/sales/sales-form";
import { _getSalesFormAction } from "@/app/(v1)/(auth)/sales/_actions/get-sales-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/_v1/breadcrumbs/links";
import EditSalesForm from "../../components/form";

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
