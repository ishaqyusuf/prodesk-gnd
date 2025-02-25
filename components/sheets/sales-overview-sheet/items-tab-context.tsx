import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";
import React, { useState } from "react";

export function useItemsTabContext() {
    const store = salesOverviewStore();
    const itemOverview = store.itemOverview;
    const [tab, setTab] = useState("production");
    let productionMode = tab == "production";
    const items = itemOverview?.items?.filter((item) =>
        productionMode ? item.produceable : true
    );
    const noItem = items?.length == 0;
    return {
        items,
        store,
        tab,
        setTab,
        noItem,
    };
}

export const ItemsTabContext = React.createContext<
    ReturnType<typeof useItemsTabContext>
>(null as any);

export const ItemsTabProvider = ItemsTabContext.Provider;
