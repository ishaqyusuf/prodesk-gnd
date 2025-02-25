import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export function useItemsTabContext() {
    const store = salesOverviewStore();
    const itemOverview = store.itemOverview;
    const [tab, setTab] = useState("production");
    let productionMode = tab == "production";
    const items = itemOverview?.items?.filter((item) =>
        productionMode ? item.produceable : true
    );
    const noItem = items?.length == 0;
    const form = useForm({
        defaultValues: {
            selectMode: false,
            batchAction: null as "mark-as-complete" | "assign-production",
            selections: [] as { itemUid: string }[],
        },
    });
    const watch = form.watch();
    const selectionArray = useFieldArray({
        control: form.control,
        name: "selections",
    });
    useEffect(() => {
        // selectionArray.fields.
        form.setValue("selections", []);
        // form.reset({
        //     selections: [],
        // });
    }, [watch.selectMode]);
    return {
        items,
        store,
        tab,
        setTab,
        noItem,
        ...watch,
        form,
        selectionArray,
        selectCount: selectionArray.fields.length,
        isSelected(uid) {
            return selectionArray.fields.some((field) => field.itemUid == uid);
        },
        toggeItemSelection(uid) {
            const index = selectionArray.fields.findIndex(
                (field) => field.itemUid == uid
            );
            if (index == -1) {
                selectionArray.append({ itemUid: uid });
            } else {
                selectionArray.remove(index);
            }
        },
    };
}

export const ItemsTabContext = React.createContext<
    ReturnType<typeof useItemsTabContext>
>(null as any);

export const ItemsTabProvider = ItemsTabContext.Provider;
export const useSalesOverviewItemsTab = () => React.useContext(ItemsTabContext);
