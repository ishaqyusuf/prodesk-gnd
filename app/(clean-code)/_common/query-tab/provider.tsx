"use client";
import useEffectLoader from "@/lib/use-effect-loader";
import { loadQueryTabsUseCase } from "@/use-cases/query-tab-use-case";
import { createContext, useContext, useState } from "react";

export const QueryTabContext = createContext<QueryTab>(null as any);
export type QueryTab = ReturnType<typeof useQueryTabContext>;
export const useQueryTab = () => useContext(QueryTabContext);
export const useQueryTabContext = () => {
    const data = useEffectLoader(loadQueryTabsUseCase);
};
export const QueryTabProvider = ({ children }) => {
    const value = useQueryTabContext();
    return (
        <QueryTabContext.Provider value={value}>
            {children}
        </QueryTabContext.Provider>
    );
};
