import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import SalesTabLayout from "@/components/tab-layouts/sales-tab-layout";
import SalesOrderMobileMenuShell from "@/components/mobile/shell/sales-order-mobile-menu";

interface Props {}
export default async function DeliveryPage({ searchParams }) {
    const response = await getSalesEstimates(queryParams(searchParams));
    return (
        <SalesTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Estimates" />
            </Breadcrumbs>
            <PageHeader
                title="Sales Estimates"
                permissions={["editOrders"]}
                newLink="/sales/estimate/new/form"
            />
            <EstimatesTableShell<ISalesOrder>
                searchParams={searchParams}
                {...response}
            />
            <SalesOrderMobileMenuShell />
            <OrderPrinter />
        </SalesTabLayout>
    );
}
