import { useTransition } from "react";
import { DykeForm, SaveMode } from "../../type";
import { useRouter, useSearchParams } from "next/navigation";
import { saveDykeSales } from "../_action/save-dyke";
import { toast } from "sonner";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { _saveDykeError } from "../_action/error/save-error";
import initDykeSaving from "../../_utils/init-dyke-saving";
import salesFormUtils from "../../../sales/edit/sales-form-utils";
import { calculateFooterEstimate } from "../footer-estimate";

export default function useDykeFormSaver(form) {
    const [saving, startTransition] = useTransition();
    const router = useRouter();
    const [orderId, id, type] = form.getValues([
        "order.orderId",
        "order.id",
        "order.type",
    ]);
    const params = useSearchParams();
    function save(data: DykeForm, mode: SaveMode) {
        startTransition(async () => {
            const errorData: any = {
                data,
            };
            try {
                const estimate = calculateFooterEstimate(data, null);
                console.log(estimate.grandTotal);

                const e = initDykeSaving(data);

                if (e.order.type == "order") {
                    e.order.paymentDueDate =
                        salesFormUtils._calculatePaymentTerm(
                            e.order.paymentTerm,
                            e.order.createdAt
                        );
                    const { paymentDueDate, paymentTerm, createdAt } = e.order;
                }
                const { order: resp } = await saveDykeSales(e);
                errorData.response = resp;
                toast.success("Saved");
                switch (mode) {
                    case "close":
                        router.push(`/sales/${type}s`);
                        break;
                    case "default":
                        if (!id || params.get("restore") == "true")
                            router.push(
                                `/sales-v2/form/${resp.type}/${resp.slug}`
                            );
                        else await _revalidate("salesV2Form");
                        break;
                    case "new":
                        router.push(`/sales-v2/form/${resp.type}`);
                        break;
                }
            } catch (error) {
                toast.error("Something went wrong");
                if (error instanceof Error) {
                    console.log(error.message);
                    errorData.message = error.message;
                }
                await _saveDykeError(errorData.errorId, errorData);
            }
        });
    }

    return {
        saving,
        save,
    };
}

