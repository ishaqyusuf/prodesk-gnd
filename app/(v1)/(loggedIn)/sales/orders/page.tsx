import { getSalesOrder } from "@/app/(v1)/(loggedIn)/sales/_actions/sales";

import { queryParams } from "@/app/(v1)/_actions/action-utils";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import { Metadata } from "next";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import { _restoreSalesOrder } from "@/app/(v1)/_actions/fix/restore-sales-order";
import { _mergeConflictCustomers } from "@/app/(v1)/_actions/fix/merge-conflict-customer";

import NewSalesBtn from "./components/new-sales-btn";
import CopyFn from "./components/copy-fn";
import OrdersTable from "./components/orders-table";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";

export const metadata: Metadata = {
    title: "Sales Orders",
};
interface Props {}
export default async function SalesOrdersPage({ searchParams }) {
    if (env.NODE_ENV == "production") redirect("/sales/dashboard/orders");
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

                <CopyFn />
                <OrdersTable searchParams={searchParams} promise={response} />
                <OrderPrinter />
            </SalesTabLayout>
        </AuthGuard>
    );
}
