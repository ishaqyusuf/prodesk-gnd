import { useForm } from "react-hook-form";
import { salesOverviewStore } from "../../store";
import { DeliveryOption } from "@/types/sales";
import { GetSalesItemOverviewAction } from "../../../../data-actions/sales-items-action";
import { QtyControlByType } from "@/app/(clean-code)/(sales)/types";
import { useEffect } from "react";

export type Shippable = {
    item: GetSalesItemOverviewAction["items"][number];
};
export type ItemShippable = {
    pendingAssignmentQty?: number;
    pendingProductionQty?: number;
    deliveryCreatedQty?: number;
    pendingDeliveryQty?: number;
    deliverableQty?: number;
    qty?: number;
    inputs: {
        label: string;
        available: number;
        total: number;
        delivered: number;
        unavailable: number;
        formKey: string;
    }[];
};
export type SelectionType = {
    [uid in string]: Partial<QtyControlByType["qty"]> & {
        selectionError?: boolean;
        shipInfo: ItemShippable;
    };
};
export type UseSalesShipmentForm = ReturnType<typeof useSalesShipmentForm>;
export type ShipmentForm = UseSalesShipmentForm["form"]["getValues"];
export function useSalesShipmentForm() {
    const store = salesOverviewStore();
    const itemView = store.itemOverview;
    const form = useForm({
        defaultValues: {
            dispatchMode: "" as DeliveryOption,
            assignedToId: "",
            selection: {} as SelectionType,
            loaded: false,
            markAll: false,
            totalSelected: 0,
            selectionError: false,
        },
    });
    const [loaded, markAll, totalSelected, selectionError] = form.watch([
        "loaded",
        "markAll",
        "totalSelected",
        "selectionError",
    ]);
    useEffect(() => {
        const selection: SelectionType = {};
        itemView?.items?.map((k) => {
            selection[k.itemControlUid] = {
                itemControlUid: k.itemControlUid,
                lh: 0,
                rh: 0,
                total: 0,
                qty: 0,
                shipInfo: {} as any,
            };
        });
        form.reset({
            selection,
        });
    }, [itemView]);

    return {
        itemView,
        form,
        store,
        totalSelected,
        selectionError,
    };
}
