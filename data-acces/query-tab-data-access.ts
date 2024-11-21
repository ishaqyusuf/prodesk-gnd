import { SiteLinksPage } from "@/app/(clean-code)/_common/query-tab/links";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export async function loadQueryTabsDta() {
    const tabs = await prisma.pageTabs.findMany({});
    return tabs.map((tab) => {
        return {
            // ...tab,
            id: tab.id,
            query: tab.query,
            tabIndex: tab.tabIndex,
            page: tab.page as SiteLinksPage,
            title: tab.title,
        };
    });
}
export async function saveQueryDta(data: Prisma.PageTabsCreateInput) {
    const resp = await prisma.pageTabs.create({
        data,
    });
    return resp;
}
