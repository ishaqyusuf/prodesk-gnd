import { dotSet } from "@/app/(clean-code)/_common/utils/utils";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";
import { LoadSalesOverviewAction } from "../../../data-actions/sales-overview.action";
import { GetSalesItemOverviewAction } from "../../../data-actions/sales-items-action";

export type SalesTabs =
    | "sales_info"
    | "production"
    | "items"
    | "payments"
    | "shipping"
    | "notification";
const data = {
    salesId: null,
    overview: null as LoadSalesOverviewAction,
    itemOverview: null as GetSalesItemOverviewAction,
    itemViewId: null as any,
    itemView: null as GetSalesItemOverviewAction["items"][number],
    payment: null,
    shipping: null,
    notification: null,
    currentTab: "sales_info" as SalesTabs,
    tabs: [] as { name: SalesTabs; label? }[],
    showTabs: false,
    tabPageLoading: false,
    tabPageLoadingTitle: null as any,
    tabLoadFailed: false,
    showFooter: false,
    adminMode: false,
};
function createTab(name: SalesTabs, label?) {
    return { name, label: label || name?.split("_")?.join(" ") };
}
export const salesTabs = {
    admin: [
        createTab("sales_info"),
        createTab("items"),
        createTab("payments"),
        createTab("shipping"),
        createTab("notification"),
    ],
};
type Action = ReturnType<typeof funcs>;
export type Data = typeof data;
type CustomerStore = Data & Action;
export type ZusFormSet = (update: (state: Data) => Partial<Data>) => void;

function funcs(set: ZusFormSet) {
    return {
        update: <K extends FieldPath<Data>>(k: K, v: FieldPathValue<Data, K>) =>
            set((state) => {
                const newState = {
                    ...state,
                };
                const d = dotSet(newState);
                d.set(k, v);
                return newState;
            }),
        reset: (props: Partial<Data>) =>
            set((state) => ({
                ...data,
                ...props,
            })),
    };
}
export const salesOverviewStore = create<CustomerStore>((set) => ({
    ...data,
    ...funcs(set),
}));
