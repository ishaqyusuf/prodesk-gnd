import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import SalesTabLayout from "@/components/tab-layouts/sales-tab-layout";
import DeliveryTableShell from "@/components/shells/delivery-table-shell";
import { getSalesDelivery } from "@/app/_actions/sales/sales-delivery";
import { Metadata } from "next";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { prisma } from "@/db";
import { labelValue } from "@/lib/utils";
import { redirect } from "next/navigation";
import { DataPageShell } from "@/components/shells/data-page-shell";
import LoadDelivery from "@/components/sales/load-delivery/load-delivery";
export const metadata: Metadata = {
    title: "Order Delivery"
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

    return (
        <DataPageShell data={orders} className="sm:px-8 space-y-4">
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Delivery" />
            </Breadcrumbs>
            <div className="flex justify-between items-end">
                <PageHeader title="Load Orders" />
                <div className="flex-1 flex justify-end space-x-2"></div>
            </div>
            <LoadDelivery />
        </DataPageShell>
    );
}
