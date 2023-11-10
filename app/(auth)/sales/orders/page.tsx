import { getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import SalesTabLayout from "@/components/tab-layouts/sales-tab-layout";
import SalesOrderMobileMenuShell from "@/components/mobile/shell/sales-order-mobile-menu";
import { _restoreSalesOrder } from "@/app/_actions/fix/restore-sales-order";
import { _mergeConflictCustomers } from "@/app/_actions/fix/merge-conflict-customer";
import BackOrderModal from "@/components/modals/sales/back-order-modal";

export const metadata: Metadata = {
    title: "Sales Orders"
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
    // await _restoreSalesOrder();
    const response = await getSalesOrder(queryParams(searchParams));
    return (
        <SalesTabLayout query={searchParams}>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Orders" />
            </Breadcrumbs>
            <PageHeader
                title="Sales Orders"
                newLink="/sales/order/new/form"
                permissions={["editOrders"]}
            />
            <SalesOrderMobileMenuShell />
            <OrdersTableShell<ISalesOrder>
                searchParams={searchParams}
                {...response}
            />
            <OrderPrinter />
            {/* <BackOrderModal /> */}
        </SalesTabLayout>
    );
}
