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
import DeliveryTableShell from "@/components/shells/delivery-table-shell";
import { getSalesDelivery } from "@/app/_actions/sales/delivery/sales-delivery";
import { Metadata } from "next";
import PickupTableShell from "@/components/shells/pickup-table-shell";
import { _getSalesPickup } from "@/app/_actions/sales/_sales-pickup";
import PickupModal from "@/components/modals/pickup-modal";
export const metadata: Metadata = {
    title: "Order Pickup"
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
    const response = await _getSalesPickup(queryParams(searchParams));
    return (
        <SalesTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Pickup" />
            </Breadcrumbs>
            <PageHeader title="Sales Pickup" />
            <PickupTableShell<ISalesOrder>
                searchParams={searchParams}
                {...response}
            />
            <PickupModal />
        </SalesTabLayout>
    );
}

