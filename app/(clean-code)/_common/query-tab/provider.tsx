"use client";
import useEffectLoader from "@/lib/use-effect-loader";
import { loadQueryTabsUseCase } from "@/use-cases/query-tab-use-case";
import { createContext, useContext, useEffect, useState } from "react";
import { siteLinks, SiteLinksPage } from "./links";
import { useSearchParams } from "next/navigation";
import { useQueryTabStore } from "./data-store";

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

    useEffect(() => {
        console.log(searchParams);
    }, [searchParams]);
    useEffect(() => {
        setPageData(initialize(page));
    }, [page]);
    return {
        page,
        setPage,
        pageData,
    };
};
export const QueryTabProvider = ({ children }) => {
    const value = useQueryTabContext();
    return (
        <QueryTabContext.Provider value={value}>
            {children}
        </QueryTabContext.Provider>
    );
};
