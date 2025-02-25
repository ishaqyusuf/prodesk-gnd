import {
    salesOverviewStore,
    salesTabs,
} from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";
import { SalesType } from "@/app/(clean-code)/(sales)/types";
import { parseAsInteger, parseAsStringEnum, useQueryStates } from "nuqs";

const openModes = [
    "quote",
    "sales",
    "sales-production",
    "dispatch-modal",
    "production-tasks",
] as const;
type Modes = (typeof openModes)[number];
export function useSalesOverviewQuery() {
    const [params, setParams] = useQueryStates({
        "sales-overview-id": parseAsInteger,
        "sales-type": parseAsStringEnum(["quote", "sales"] as SalesType[]),
        mode: parseAsStringEnum([...openModes]),
    });

    return {
        ...params,
        setParams,

        open(salesOverviewId: number, mode: Modes) {
            let salesType: SalesType = mode == "quote" ? "quote" : "order";
            salesOverviewStore.getState().reset({
                salesId: salesOverviewId,
                tabs: tabs(),
                showTabs: mode != "sales-production",
                showFooter: mode == "quote" || mode == "sales",
                adminMode: mode != "production-tasks",
                currentTab: currentTab(),
            });
            setParams({
                "sales-overview-id": salesOverviewId,
                "sales-type": salesType,
                mode,
            });
            function currentTab() {
                switch (mode) {
                    case "sales-production":
                    case "production-tasks":
                        return "items";
                    case "dispatch-modal":
                        return "shipping_overview";
                    default:
                        return "sales_info";
                }
            }
            function tabs() {
                switch (mode) {
                    case "production-tasks":
                        return salesTabs.productionTasks;
                    case "quote":
                        return salesTabs.quotes;
                    default:
                        return salesTabs.admin;
                }
            }
        },
    };
}
