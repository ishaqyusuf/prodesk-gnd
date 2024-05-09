"use server";

import { getDykeFormAction } from "@/app/(v2)/(loggedIn)/sales-v2/form/_action/get-dyke-form";
import { ISalesType } from "@/types/sales";

export async function copyDykeSales(slug, as: ISalesType) {
    const form = await getDykeFormAction(as, slug);
    // form.order.id

    let link = "";
    return {
        link,
    };
}
