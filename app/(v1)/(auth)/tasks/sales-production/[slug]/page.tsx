import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    EstimatesCrumb,
    OrderViewCrumb,
    OrdersCrumb,
} from "@/components/_v1/breadcrumbs/links";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import SalesProdSubmitModal from "@/components/_v1/modals/sales-prod-submit-modal";
import SalesTimelineModal from "@/components/_v1/modals/sales-timeline-modal";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import OverviewDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/components/details-section";
import ItemDetailsSection from "@/app/(v1)/(auth)/sales/order/[slug]/components/item-details";
import PaymentHistory from "@/app/(v1)/(auth)/sales/order/[slug]/components/payment-history";
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
    console.log(order);
    order.ctx = {
        prodPage: true,
    };
    if (!order) return notFound();
    metadata.description = order.orderId;
    return (
        <DataPageShell className="" data={order}>
            <Breadcrumbs>
                <BreadLink
                    link={"/tasks/sales-productions"}
                    isFirst
                    title="Productions"
                />
                <OrderViewCrumb slug={order.orderId} isLast />
            </Breadcrumbs>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col space-y-4">
                    <OverviewDetailsSection myProd />
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
