import { createContext, useContext, useEffect, useState } from "react";
import { SalesItemProp } from "../orders-page-cells";
import { generateRandomString } from "@/lib/utils";
import {
    getSalesItemOverviewUseCase,
    GetSalesOverview,
} from "../../use-case/sales-item-use-case";
import { useInifinityDataTable } from "@/components/(clean-code)/data-table/use-data-table";
import { SalesDispatchListDto } from "../../data-access/dto/sales-shipping-dto";
import { getSalesListByIdUseCase } from "../../use-case/sales-list-use-case";
import { toast } from "sonner";

interface Props {}
type TabItems = "itemView" | "makePayment" | "createShipping" | "shippingView";
export type PrimaryTabs =
    | "general"
    | "items"
    | "payments"
    | "shipping"
    | "notifications";
export type PageType = "pickup" | "delivery" | "quote" | "sales";
type TabData = {
    payload?;
    payloadSlug?;
    slug: TabItems;
    meta?: any;
};
export const OverviewContext = createContext<
    ReturnType<typeof useOverviewContext>
>(null as any);
export const useOverviewContext = (_item: SalesItemProp) => {
    const [item, setItem] = useState(_item);
    const dataKey = generateRandomString();
    const [overview, setOverview] = useState<GetSalesOverview>();

    async function load() {
        const resp = await getSalesItemOverviewUseCase(item.slug, item.type);
        setOverview(resp);
        return resp;
    }
    const [loadId, setLoadId] = useState(null);
    const [loadedId, setLoadedId] = useState(null);
    useEffect(() => {
        if (loadId != loadedId && loadId != null)
            load().then((resp) => {
                setLoadedId(loadId);
            });
    }, [loadId, loadedId]);
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
    const [primaryTab, setPrimaryTab] = useState<PrimaryTabs>("general");
    const [page, setPage] = useState<PageType>("sales");
    const [pageData, setPageData] = useState(null);
    function rowChanged() {
        setTabData(null);
        setPrimaryTab("general");
    }
    useEffect(() => {
        setTabData(null);
    }, [primaryTab]);
    function openShipping() {
        setTimeout(() => {
            if ((pageData && page == "delivery") || page == "pickup") {
                const pd: SalesDispatchListDto = pageData as any;
                __ctx.viewShipping(pd.dispatchId);
                console.log("OPENING SHIPPING>>>");
            }
        }, 500);
    }
    const __ctx = {
        openShipping,
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
        setItem,
        page,
        setPage,
        pageData,
        setPageData,
        loader: {
            loadId,
            loadedId,
            setLoadId,
            setLoadedId,
            refresh() {
                setLoadId(generateRandomString());
            },
        },
    };
    return __ctx;
};
export const useSalesOverview = () => useContext(OverviewContext);
export function OverviewProvider({
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
export function DispatchOverviewProvider({
    children,
    item,
}: {
    children;
    item: SalesDispatchListDto;
}) {
    const value = useOverviewContext(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        value.setPage("delivery");
        value.setPageData(item);
        getSalesListByIdUseCase(item.order.id)
            .then((result) => {
                console.log(result);

                value.setItem(result);
                setTimeout(() => {
                    value.setPrimaryTab("shipping");
                    setReady(true);
                }, 500);
            })
            .catch((e) => {
                toast.error(e.message);
            });
    }, []);
    if (!ready) return null;
    return (
        <OverviewContext.Provider value={value}>
            {children}
        </OverviewContext.Provider>
    );
}
