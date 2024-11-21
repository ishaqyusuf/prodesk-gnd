"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import { loadQueryTabsDta } from "@/data-acces/query-tab-data-access";

export type QueryTabs = AsyncFnType<typeof loadQueryTabsUseCase>;
export async function loadQueryTabsUseCase() {
    const tabs = await loadQueryTabsDta();
    return tabs;
}
