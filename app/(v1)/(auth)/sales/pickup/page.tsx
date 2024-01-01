import {
    getSalesEstimates,
    getSalesOrder,
} from "@/app/(v1)/_actions/sales/sales";
import OrdersTableShell from "@/app/(v1)/(auth)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import EstimatesTableShell from "@/components/_v1/shells/estimates-table-shell";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import DeliveryTableShell from "@/components/_v1/shells/delivery-table-shell";
import { getSalesDelivery } from "@/app/(v1)/_actions/sales/delivery/sales-delivery";
import { Metadata } from "next";
import PickupTableShell from "@/components/_v1/shells/pickup-table-shell";
import { _getSalesPickup } from "@/app/(v1)/_actions/sales/_sales-pickup";
import PickupModal from "@/components/_v1/modals/pickup-modal";
export const metadata: Metadata = {
    title: "Order Pickup",
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
