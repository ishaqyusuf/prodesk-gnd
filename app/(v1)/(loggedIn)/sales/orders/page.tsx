import { getSalesOrder } from "@/app/(v1)/_actions/sales/sales";
import OrdersTableShell from "@/app/(v1)/(loggedIn)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import { Metadata } from "next";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import SalesOrderMobileMenuShell from "@/components/_v1/mobile/shell/sales-order-mobile-menu";
import { _restoreSalesOrder } from "@/app/(v1)/_actions/fix/restore-sales-order";
import { _mergeConflictCustomers } from "@/app/(v1)/_actions/fix/merge-conflict-customer";
import BackOrderModal from "@/components/_v1/modals/sales/back-order-modal";
import AssignProdModal from "@/components/_v1/modals/assign-prod-modal";
import AuthGuard from "@/components/_v1/auth-guard";
import NewSalesBtn from "./components/new-sales-btn";
import CopyFn from "./components/copy-fn";

export const metadata: Metadata = {
    title: "Sales Orders",
};
interface Props {}
export default async function SalesOrdersPage({ searchParams }) {
    // await _restoreSalesOrder();

    // const s = await prisma.salesOrderItems.findMany({
    //     where: {
    //         deletedAt: {
    //             gt: dayjs().set("hours", 1).toISOString(),
    //         },
    //     },
    // });
    // console.log(s.length);

    const response = await getSalesOrder({
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
                <SalesOrderMobileMenuShell />
                <OrdersTableShell<ISalesOrder>
                    searchParams={searchParams}
                    {...response}
                />
                <OrderPrinter />
                <AssignProdModal />
                <BackOrderModal />
            </SalesTabLayout>
        </AuthGuard>
    );
}
