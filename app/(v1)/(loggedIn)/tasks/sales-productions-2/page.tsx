import { Metadata } from "next";

import AuthGuard from "@/components/_v1/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { Shell } from "@/components/shell";
import ProductionPageTabs from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/production-page-tabs";
import { _getProductionList } from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/actions";
import ProductionList from "@/app/(v2)/(loggedIn)/sales-v2/productions/_components/production-list";

export const metadata: Metadata = {
    title: "Sales Productions",
};
export default function SalesProductionPage({ searchParams }) {
    const p = _getProductionList({ query: searchParams, production: true });

    return (
        <AuthGuard can={[]}>
            <ProductionPageTabs prod />
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Productions" isLast />
            </Breadcrumbs>
            <Shell className="px-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Productions
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2"></div>
                </div>
                <ProductionList prod promise={p} />
            </Shell>
        </AuthGuard>
    );
}
