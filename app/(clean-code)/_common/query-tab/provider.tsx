"use client";
import useEffectLoader from "@/lib/use-effect-loader";
import { loadQueryTabsUseCase } from "@/use-cases/query-tab-use-case";
import { createContext, useContext, useEffect, useState } from "react";
import { siteLinks, SiteLinksPage } from "./links";
import { useSearchParams } from "next/navigation";
import { useQueryTabStore } from "./data-store";
import qs from "qs";
import { isEqual } from "lodash";
import { openQueryTab } from "./query-tab-form";
export const QueryTabContext = createContext<QueryTab>(null as any);
export type QueryTab = ReturnType<typeof useQueryTabContext>;
export const useQueryTab = () => useContext(QueryTabContext);
export const useQueryTabContext = () => {
    const data = useEffectLoader(loadQueryTabsUseCase);
    const store = useQueryTabStore((state) => state);
    useEffect(() => {
        loadQueryTabsUseCase().then((result) => {
            store.update("allTabs", result);
        });
    }, []);
    const [page, setPage] = useState<SiteLinksPage>();
    // data.data;
    const [pageData, setPageData] =
        useState<ReturnType<typeof initialize>>(null);
    function initialize(page) {
        const links = data.data
            ?.filter((d) => d.page == page)
            .sort((a, b) => a.tabIndex - b.tabIndex);
        return {
            links,
            rootPath: siteLinks[page],
            linksCount: links?.length,
        };
    }
    const searchParams = useSearchParams();
    const [newQuery, setNewQuery] = useState(null);
    useEffect(() => {
        const q = {};
        searchParams.forEach((v, _q) => {
            if (_q) q[_q] = v;
        });
        if (!pageData?.links?.some((s) => isEqual(qs.parse(s.query), q))) {
            setNewQuery(q);
        } else setNewQuery(null);
    }, [searchParams]);
    useEffect(() => {
        setPageData(initialize(page));
    }, [page]);
    const ctx = {
        page,
        setPage,
        newQuery,
        pageData,
        createTab() {
            openQueryTab(ctx, {
                query: newQuery,
            });
        },
    };
    return ctx;
};
export const QueryTabProvider = ({ children }) => {
    const value = useQueryTabContext();
    return (
        <QueryTabContext.Provider value={value}>
            {children}
        </QueryTabContext.Provider>
    );
};
