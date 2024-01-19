import { Metadata } from "next";
import SalesFormComponent from "../components";
import { getDykeFormAction } from "../_action/get-dyke-form";

export const metadata: Metadata = {
    title: "Sales Form",
};
export default async function SalesForm({ searchParams, params }) {
    const form = await getDykeFormAction(params.slug?.[0]);
    // form.itemArray[0]?.item.formStepArray[0]?.item.
    return (
        <div className="sm:p-8 px-4">
            <SalesFormComponent defaultValues={form} />
        </div>
    );
}
