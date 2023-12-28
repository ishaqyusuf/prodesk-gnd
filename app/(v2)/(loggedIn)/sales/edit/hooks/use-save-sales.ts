import { useFormContext } from "react-hook-form";
import { ISalesForm } from "../type";
import { useCallback, useContext, useTransition } from "react";
import { SalesFormContext } from "../ctx";
import { numeric, toFixed } from "@/lib/use-number";
import { removeEmptyValues } from "@/lib/utils";
import { SalesOrderItems, SalesOrders } from "@prisma/client";
import { SaveOrderActionProps } from "@/types/sales";
import { saveSaleAction } from "../../_actions/save-sales.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import debounce from "debounce";
import useDeepCompareEffect from "use-deep-compare-effect";

export default function useSaveSalesHook() {
    const form = useFormContext<ISalesForm>();
    const watchForm = form.watch();
    const [saving, startTransaction] = useTransition();
    const ctx = useContext(SalesFormContext);

    async function save(
        and: "close" | "new" | "default" = "default",
        autoSave = false,
        data: any = null
    ) {
        startTransaction(async () => {
            data = formData(
                !data ? form.getValues() : data,
                ctx.data.paidAmount
            );
            data.autoSave = autoSave;
            const order = await saveSaleAction(data.id, data.order, data.items);
            switch (and) {
                case "close":
                    router.push(`/sales/${order.type}s`);
                    break;
                case "new":
                    router.push(`/sales/edit/${order.type}/new`);
                    break;
                case "default":
                    if (!ctx.data.form.id)
                        router.push(`/sales/edit/${order.type}/${order.slug}`);
                    break;
            }
            toast.success("Saved");
        });
    }
    const debouncedSave = useCallback(
        debounce(() => {
            form.handleSubmit((d) => {
                if (d.customerId) {
                    save("default", true, d);
                } else {
                    toast.error(
                        "Autosave paused, requires customer information."
                    );
                }
            })();
            // methods.handleSubmit(onSubmit)();
        }, 5000),
        [form]
    );
    useDeepCompareEffect(() => {
        // console.log(watchForm.items?.[2]?.description);
        if (
            form.formState.isDirty &&
            Object.keys(form.formState.dirtyFields).length
        ) {
            // console.log(form.formState.dirtyFields);
            debouncedSave();
        }
    }, [watchForm, form]);
    const router = useRouter();
    return {
        saving,
        save,
    };
}
function formData(data: ISalesForm, paidAmount): SaveOrderActionProps {
    let { _lineSummary, items, id, ...form } = data;
    form.amountDue = +toFixed(Number((form.grandTotal || 0) - paidAmount));
    form.meta = removeEmptyValues(form.meta);
    const deleteIds: any = [];
    items = items
        .map(({ salesOrderId, _ctx, ...item }, index) => {
            if (!item.description && !item.total) {
                deleteIds.push(item.id);
                return null;
            }
            item.meta.uid = index;
            return numeric<SalesOrderItems>(
                ["qty", "price", "rate", "tax", "taxPercenatage", "total"],
                item
            );
        })
        .filter(Boolean);
    return {
        id,
        order: numeric<SalesOrders>(
            ["grandTotal", "amountDue", "tax", "taxPercentage", "subTotal"],
            form
        ) as any,
        deleteIds,
        items,
    };
}