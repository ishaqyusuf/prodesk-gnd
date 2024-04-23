import { Metadata } from "next";
import SalesFormComponent from "../components";
import { getDykeFormAction } from "../_action/get-dyke-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import AuthGuard from "@/components/_v1/auth-guard";
import DebugSaveError from "./_debug/debug-save-error";

export const metadata: Metadata = {
    title: "Sales Form",
    description: "",
};
export default async function SalesForm({ params }) {
    const [type, slug] = params.slug;
    const form = await getDykeFormAction(type, slug);
    // form.itemArray[0]?.item.formStepArray[0]?.item.

    metadata.title = `${slug ? "Edit " : "New "} ${form.order.type} ${
        slug && `| ${slug}`
    }`;
    return (
        <AuthGuard can={["editOrders"]}>
            <div className="sm:px-8 px-4">
                <Breadcrumbs>
                    <BreadLink title={"Sales"} isFirst link={"/sales/orders"} />
                    {/* <BreadLink title={orderId ? "Edit" : "New"} isLast /> */}
                </Breadcrumbs>
                <SalesFormComponent defaultValues={form} />
            </div>
        </AuthGuard>
    );
}
