import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import SalesTabLayout from "@/components/tab-layouts/sales-tab-layout";
import DeliveryTableShell from "@/components/shells/delivery-table-shell";
import { getSalesDelivery } from "@/app/_actions/sales/delivery/sales-delivery";
import { Metadata } from "next";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { prisma } from "@/db";
import { labelValue } from "@/lib/utils";
import { redirect } from "next/navigation";
import { DataPageShell } from "@/components/shells/data-page-shell";
import LoadDelivery from "@/components/sales/load-delivery/load-delivery";
import InspectBackOrderModal from "@/components/modals/sales/inspect-back-order-modal";
export const metadata: Metadata = {
    title: "Ready for Delivery"
};
interface Props {}
export default async function LoadDeliveryPage({ searchParams }) {
    const orderIds = searchParams.orderIds?.split(",");
    if (!orderIds.length) redirect("/sales/orders");
    const orders = await prisma.salesOrders.findMany({
        where: {
            slug: {
                in: orderIds
            }
        },
        include: {
            items: true,
            customer: true,
            shippingAddress: true
        }
    });
    const data = { orders, action: "ready" };
    return (
        <DataPageShell data={data} className="sm:px-8 space-y-4">
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Delivery" link={"/sales/delivery"} />
                <BreadLink isLast title="Loading" />
            </Breadcrumbs>

            <LoadDelivery title={"Preprare for delivery"} />
            <InspectBackOrderModal />
        </DataPageShell>
    );
}
