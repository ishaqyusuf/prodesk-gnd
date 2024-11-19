"use server";

import { loadQueryTabsDta } from "@/data-acces/query-tab-data-access";

export async function loadQueryTabsUseCase() {
    const tabs = await loadQueryTabsDta();
    return tabs;
}
