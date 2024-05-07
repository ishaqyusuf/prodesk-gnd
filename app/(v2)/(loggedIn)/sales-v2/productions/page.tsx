import { Metadata } from "next";
import { _getProductionList } from "./_components/actions";
import ProductionList from "./_components/production-list";
import AuthGuard from "@/components/_v1/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { Shell } from "@/components/shell";
import ProductionPageTabs from "./_components/production-page-tabs";

export const metadata: Metadata = {
    title: "Sales Productions",
};
export default function SalesProductionPage({ searchParams }) {
    const p = _getProductionList({ query: searchParams });

    return (
        <AuthGuard can={["viewOrderProduction", "viewOrders"]}>
            <ProductionPageTabs />
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
                <ProductionList promise={p} />
            </Shell>
        </AuthGuard>
    );
}
