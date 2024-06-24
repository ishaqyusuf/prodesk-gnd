import { Metadata } from "next";
import { _getProductionList } from "./_components/actions";
import ProductionList from "./_components/production-list";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { Shell } from "@/components/shell";
import PageHeader from "@/components/_v1/page-header";

export const metadata: Metadata = {
    title: "Sales Productions",
};
export default function SalesProductionPage({ searchParams }) {
    const p = _getProductionList({ query: searchParams });
    const dueToday = _getProductionList({
        query: {
            dueToday: true,
        },
    });
    return (
        <AuthGuard can={["viewOrderProduction"]}>
            {/* <ProductionPageTabs /> */}
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Productions" isLast />
            </Breadcrumbs>
            <Shell className="px-8">
                <PageHeader title="Due Today" />
                <ProductionList simple promise={dueToday} />
                <PageHeader title="Productions" />
                <ProductionList promise={p} />
            </Shell>
        </AuthGuard>
    );
}
