import { useFormContext } from "react-hook-form";
import { ISalesForm } from "../type";
import { useContext, useTransition } from "react";
import { deepCopy } from "@/lib/deep-copy";
import { SalesFormContext } from "../ctx";
import { numeric, toFixed } from "@/lib/use-number";
import { removeEmptyValues } from "@/lib/utils";
import { SalesOrderItems, SalesOrders } from "@prisma/client";
import { SaveOrderActionProps } from "@/types/sales";
import { saveSaleAction } from "../../_actions/save-sales.action";

export default function useSaveSalesHook() {
    const form = useFormContext<ISalesForm>();
    const [saving, startTransaction] = useTransition();
    const ctx = useContext(SalesFormContext);
    return {
        saving,
        async save(
            and: "close" | "new" | "default" = "default",
            autoSave = false
        ) {
            startTransaction(async () => {
                const data = formData(form.getValues(), ctx.data.paidAmount);
                data.autoSave = autoSave;
                await saveSaleAction(data.id, data.order, data.items);
            });
        },
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
