import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    EstimatesCrumb,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/_v1/breadcrumbs/links";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import SalesTimelineModal from "@/components/_v1/modals/sales-timeline-modal";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import OverviewDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/components/details-section";
import ItemDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/components/item-details";
import Timeline from "@/app/(v1)/(auth)/sales/order/[slug]/components/timeline";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { ISalesOrder } from "@/types/sales";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Order Overview",
    description: "Order Overview",
};
export default async function SalesOrderPage({ params: { slug } }) {
    const order: ISalesOrder = (await getOrderAction(slug)) as any;
    if (!order) return notFound();
    metadata.description = order.orderId;
    return (
        <DataPageShell className="px-8" data={order}>
            <Breadcrumbs>
                <EstimatesCrumb isFirst />
                <OrderViewCrumb slug={order.orderId} isLast />
            </Breadcrumbs>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col space-y-4">
                    <OverviewDetailsSection estimate />
                    <ItemDetailsSection />
                </div>
                <div className="space-y-4">
                    {/* <PaymentHistory /> */}
                    <Timeline />
                </div>
            </div>
            {/* <ProductionAssignDialog />
             */}
            <SalesTimelineModal />
            <SalesPaymentModal />
            <OrderPrinter />
        </DataPageShell>
    );
}
