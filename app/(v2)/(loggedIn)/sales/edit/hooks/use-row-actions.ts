import salesFormUtils from "../sales-form-utils";
import { useContext } from "react";
import { SalesFormContext, SalesRowContext } from "../ctx";
import { deepCopy } from "@/lib/deep-copy";

export default function useSalesInvoiceRowActions(index, id, field) {
    const { remove, insert, update, move } = useContext(SalesRowContext);
    const { setSummary } = useContext(SalesFormContext);
    return {
        clear() {
            const ne = salesFormUtils.generateInvoiceItem({
                meta: {},
                _ctx: {
                    id,
                },
            });
            update(index, ne);
        },
        remove() {
            remove(index);
            setSummary((s) => {
                let newSummary = { ...s };
                delete newSummary[id];
                return newSummary;
            });
        },
        copy() {
            // const {id, ...rest} = field;
            const newData = salesFormUtils.copySalesItem(field);
            insert(index + 1, newData as any);
        },
        addLine(where: "before" | "after") {
            let pos = where == "before" ? -1 : 1;
            const newData = salesFormUtils.generateInvoiceItem();
            insert(index + pos, newData as any);
        },
        move(toIndex) {
            move(index, toIndex);
        },
    };
}
