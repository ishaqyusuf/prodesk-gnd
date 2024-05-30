import { Metadata } from "next";

import AuthGuard from "@/components/_v1/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { Shell } from "@/components/shell";

import { _getProductionList } from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/actions";
import ProductionList from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/production-list";
import PageHeader from "@/components/_v1/page-header";

export const metadata: Metadata = {
    title: "Sales Productions",
};
export default function SalesProductionPage({ searchParams }) {
    const p = _getProductionList({ query: searchParams, production: true });
    const dueToday = _getProductionList({
        query: {
            dueToday: true,
        },
        production: true,
    });

    return (
        <AuthGuard can={[]}>
            {/* <ProductionPageTabs prod /> */}
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Productions" isLast />
            </Breadcrumbs>
            <Shell className="px-8">
                <PageHeader title="Due Today" />
                <ProductionList prod simple promise={dueToday} />
                <PageHeader title="Productions" />
                <ProductionList prod promise={p} />
            </Shell>
        </AuthGuard>
    );
}
