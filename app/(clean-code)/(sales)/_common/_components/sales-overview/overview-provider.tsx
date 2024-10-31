import { createContext, useContext, useEffect, useState } from "react";
import { SalesItemProp } from "../orders-page-cells";
import { generateRandomString } from "@/lib/utils";
import {
    getSalesItemOverviewUseCase,
    GetSalesOverview,
} from "../../use-case/sales-item-use-case";

interface Props {}
type TabItems = "itemView" | "makePayment" | "createShipping";
type TabData = {
    payload?;
    payloadSlug?;
    slug: TabItems;
    meta?: any;
};
export const OverviewContext = createContext<
    ReturnType<typeof useOverviewContext>
>(null as any);
export const useOverviewContext = (item: SalesItemProp) => {
    const dataKey = generateRandomString();
    const [overview, setOverview] = useState<GetSalesOverview>();
    async function load() {
        setOverview(await getSalesItemOverviewUseCase(item.slug, item.type));
    }
    const [tabData, setTabData] = useState<TabData>(null);

    useEffect(() => {
        if (tabData) {
            switch (tabData.slug) {
                case "itemView":
                    openItemTab(tabData.meta?.groupIndex, tabData.payloadSlug);
                    break;
            }
        }
    }, [overview]);
    async function refresh() {
        await load();
    }
    function openItemTab(groupIndex, itemIndex) {
        const payload = overview?.itemGroup?.[groupIndex];
        setTabData({
            slug: "itemView",
            payloadSlug: itemIndex,
            payload,
            meta: {
                groupIndex,
            },
        });
    }
    return {
        refresh,
        openItemTab,
        dataKey,
        tabData,
        setTabData,
        overview,
        load,
        item,
    };
};
export const useSalesOverview = () => useContext(OverviewContext);
export default function OverviewProvider({
    children,
    item,
}: {
    children;
    item: SalesItemProp;
}) {
    const value = useOverviewContext(item);
    return (
        <OverviewContext.Provider value={value}>
            {children}
        </OverviewContext.Provider>
    );
}
