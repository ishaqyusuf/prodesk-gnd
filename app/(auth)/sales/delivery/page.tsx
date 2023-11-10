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
export const metadata: Metadata = {
    title: "Order Delivery"
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
    const response = await getSalesDelivery(queryParams(searchParams));
    const _orders = await prisma.salesOrders.findMany({
        where: {
            deliveryOption: "delivery"
        },
        select: {
            id: true,
            status: true,
            builtQty: true,
            prodQty: true,
            prodStatus: true,
            deliveredAt: true
        }
    });
    const stats = [
        {
            label: "Pending",
            color: "orange",
            link: "/sales/delivery?page=1&_deliveryStatus=pending production",
            value: _orders.filter(d => d.prodStatus != "Completed").length
        },
        {
            label: "Ready",
            link: "/sales/delivery?page=1&_deliveryStatus=ready",
            value: _orders.filter(
                d =>
                    d.prodStatus == "Completed" &&
                    !["In Transit", "Return", "Delivered"].includes(d.status)
            ).length,
            color: "teal"
        },
        {
            label: "In Transit",
            link: "/sales/delivery?page=1&_deliveryStatus=transit",
            value: _orders.filter(d => d.status == "In Transit").length,
            color: "purple"
        },
        {
            label: "Delivered",
            link: "/sales/delivery?page=1&_deliveryStatus=delivered",
            value: _orders.filter(o => o.deliveredAt != null).length,
            color: "green"
        }
    ];
    return (
        <SalesTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Delivery" />
            </Breadcrumbs>
            <div className="flex justify-between items-end">
                <PageHeader title="Sales Delivery" />
                <div className="flex-1 h-20 flex justify-end space-x-2">
                    {stats.map((s, i) => (
                        <StartCard
                            key={i}
                            href={s.link}
                            icon="lineChart"
                            className={`bg-gradient-to-tr from-${s.color}-400 to-${s.color}-400 hover:from-${s.color}-500 hover:to-${s.color}-500`}
                            label={s.label}
                            value={s.value}
                        />
                    ))}
                </div>
            </div>
            <DeliveryTableShell<ISalesOrder>
                searchParams={searchParams}
                {...response}
            />
            <OrderPrinter />
        </SalesTabLayout>
    );
}
