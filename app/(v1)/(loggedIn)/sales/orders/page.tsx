import { getSalesOrder } from "@/app/(v1)/(loggedIn)/sales/_actions/sales";

import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import { Metadata } from "next";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import { _restoreSalesOrder } from "@/app/(v1)/_actions/fix/restore-sales-order";
import { _mergeConflictCustomers } from "@/app/(v1)/_actions/fix/merge-conflict-customer";
import BackOrderModal from "@/components/_v1/modals/sales/back-order-modal";

import NewSalesBtn from "./components/new-sales-btn";
import CopyFn from "./components/copy-fn";
import OrdersTable from "./components/orders-table";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";

export const metadata: Metadata = {
    title: "Sales Orders",
};
interface Props {}
export default async function SalesOrdersPage({ searchParams }) {
    const response = getSalesOrder({
        ...queryParams(searchParams),
        _noBackOrder: true,
        isDyke: false,
    });

    return (
        <AuthGuard can={["viewOrders"]}>
            {/* <RestoreOrders /> */}
            <SalesTabLayout query={searchParams}>
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink isLast title="Orders" />
                </Breadcrumbs>
                <PageHeader
                    title="Sales Orders"
                    // newLink="/sales/edit/order/new"
                    Action={NewSalesBtn}
                    permissions={["editOrders"]}
                />
                <CopyFn />
                <OrdersTable searchParams={searchParams} promise={response} />
                <OrderPrinter />
            </SalesTabLayout>
        </AuthGuard>
    );
}
