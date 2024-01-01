import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    EstimatesCrumb,
    OrderViewCrumb,
    ProductionsCrumb,
} from "@/components/_v1/breadcrumbs/links";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import SalesProdSubmitModal from "@/components/_v1/modals/sales-prod-submit-modal";
import SalesTimelineModal from "@/components/_v1/modals/sales-timeline-modal";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import OverviewDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/overview/details-section";
import ItemDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/overview/item-details";
import Timeline from "@/app/(v1)/(auth)/sales/order/[slug]/overview/timeline";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { ISalesOrder } from "@/types/sales";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Sales Production",
    description: "Order Overview",
};
export default async function SalesOrderPage({ params: { slug } }) {
    const order: ISalesOrder = (await getOrderAction(slug)) as any;
    // console.log(order);
    order.ctx = {
        prodPage: true,
    };
    if (!order) return notFound();
    metadata.description = order.orderId;
    return (
        <DataPageShell className="px-8" data={order}>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />

                <ProductionsCrumb />
                <OrderViewCrumb slug={order.orderId} isLast />
            </Breadcrumbs>

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 flex flex-col space-y-4">
                    <OverviewDetailsSection />
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
            <SalesProdSubmitModal />
        </DataPageShell>
    );
}
