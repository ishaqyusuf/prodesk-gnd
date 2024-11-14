import { createContext, useContext, useEffect, useState } from "react";
import { SalesItemProp } from "../orders-page-cells";
import { generateRandomString } from "@/lib/utils";
import {
    getSalesItemOverviewUseCase,
    GetSalesOverview,
} from "../../use-case/sales-item-use-case";
import { useInifinityDataTable } from "@/components/(clean-code)/data-table/use-data-table";

interface Props {}
type TabItems = "itemView" | "makePayment" | "createShipping" | "shippingView";
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
        console.log(overview);
        if (tabData) {
            switch (tabData.slug) {
                case "itemView":
                    openItemTab(tabData.meta?.groupIndex, tabData.payloadSlug);
                    break;
            }
        }
    }, [overview]);
    const ctx = useInifinityDataTable();

    async function refresh() {
        await load();
        ctx.refresh.activate();
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
    function createShipping() {
        setTabData({
            slug: "createShipping",
        });
    }
    const [primaryTab, setPrimaryTab] = useState("general");
    function rowChanged() {
        setTabData(null);
        setPrimaryTab("general");
    }
    useEffect(() => {
        setTabData(null);
    }, [primaryTab]);
    return {
        refresh,
        primaryTab,
        setPrimaryTab,
        rowChanged,
        openItemTab,
        createShipping,
        viewShipping(slug) {
            setTabData({
                slug: "shippingView",
                payloadSlug: slug,
            });
        },
        dataKey,
        tabData,
        setTabData,
        closeSecondaryTab() {
            setTabData(null);
        },
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
