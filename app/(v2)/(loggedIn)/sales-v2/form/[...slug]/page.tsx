import { Metadata } from "next";
import SalesFormComponent from "../components";
import { getDykeFormAction } from "../_action/get-dyke-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

export const metadata: Metadata = {
    title: "Sales Form",
};
export default async function SalesForm({ params }) {
    const [type, slug] = params.slug;

    const form = await getDykeFormAction(type, slug);
    // form.itemArray[0]?.item.formStepArray[0]?.item.
    return (
        <div className="sm:px-8 px-4">
            <Breadcrumbs>
                <BreadLink title={"Sales"} isFirst link={"/sales/orders"} />
                {/* <BreadLink title={orderId ? "Edit" : "New"} isLast /> */}
            </Breadcrumbs>
            <SalesFormComponent defaultValues={form} />
        </div>
    );
}
