import { useTransition } from "react";
import { DykeForm } from "../../type";
import { useRouter, useSearchParams } from "next/navigation";

import { saveDykeSales } from "../_action/save-dyke";
import { toast } from "sonner";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";

import { _saveDykeError } from "../_action/error/save-error";
import initDykeSaving from "../../_utils/init-dyke-saving";
import salesFormUtils from "../../../sales/edit/sales-form-utils";

export default function useDykeFormSaver(form) {
    const [saving, startTransition] = useTransition();
    const router = useRouter();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const params = useSearchParams();
    function save(data: DykeForm) {
        startTransition(async () => {
            const errorData: any = {};
            try {
                const e = initDykeSaving(data);
                if (e.order.type == "order") {
                    e.order.paymentDueDate =
                        salesFormUtils._calculatePaymentTerm(
                            e.order.paymentTerm,
                            e.order.createdAt
                        );
                }
                // console.log(e);
                // return;

                const { order: resp } = await saveDykeSales(e);
                errorData.response = resp;
                toast.success("Saved");
                if (!id || params.get("restore") == "true")
                    router.push(`/sales-v2/form/${resp.type}/${resp.slug}`);
                else await _revalidate("salesV2Form");
            } catch (error) {
                toast.error("Something went wrong");
                if (error instanceof Error) console.log(error.message);
                await _saveDykeError(errorData.errorId, errorData);
            }
        });
    }

    return {
        saving,
        save,
    };
}
