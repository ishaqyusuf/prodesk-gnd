import {
    getSalesEstimates,
    getSalesOrder,
} from "@/app/(v1)/_actions/sales/sales";
import OrdersTableShell from "@/app/(v1)/(loggedIn)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import EstimatesTableShell from "@/components/_v1/shells/estimates-table-shell";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import SalesOrderMobileMenuShell from "@/components/_v1/mobile/shell/sales-order-mobile-menu";
import NewEstimateBtn from "./new-sales-btn";
import AuthGuard from "@/components/_v1/auth-guard";
import DebugSaveError from "@/app/(v2)/(loggedIn)/sales-v2/form/[...slug]/_debug/debug-save-error";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sales Quote",
};
interface Props {}

export default async function SalesEstimatesPage({ searchParams }) {
    const response = await getSalesEstimates(queryParams(searchParams));
    return (
        <AuthGuard can={["viewEstimates"]}>
            <DebugSaveError />
            <SalesTabLayout>
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink isLast title="Estimates" />
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
                <SalesOrderMobileMenuShell />
                <OrderPrinter />
            </SalesTabLayout>
        </AuthGuard>
    );
}
