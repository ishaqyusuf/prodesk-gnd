import { getSalesEstimates } from "@/app/(v1)/(loggedIn)/sales/_actions/sales";

import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import EstimatesTableShell from "@/components/_v1/shells/estimates-table-shell";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import NewEstimateBtn from "./new-sales-btn";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { Metadata } from "next";
import { prisma } from "@/db";

export const metadata: Metadata = {
    title: "Sales Quote",
};
interface Props {}

export default async function SalesEstimatesPage({ searchParams }) {
    const response = await getSalesEstimates(queryParams(searchParams));
    return (
        <AuthGuard can={["viewEstimates"]}>
            <SalesTabLayout>
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink isLast title="Quotes" />
                </Breadcrumbs>
                <PageHeader
                    title="Sales Quotes"
                    permissions={["editOrders"]}
                    Action={NewEstimateBtn}
                    // newLink="/sales/edit/estimate/new"
                />
                <EstimatesTableShell<ISalesOrder>
                    searchParams={searchParams}
                    {...response}
                />
                <OrderPrinter />
            </SalesTabLayout>
        </AuthGuard>
    );
}
