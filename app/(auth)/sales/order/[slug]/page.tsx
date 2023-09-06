import { getOrderAction } from "@/app/_actions/sales/sales";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink, OrderViewCrumb } from "@/components/breadcrumbs/links";
import SalesPaymentModal from "@/components/modals/sales-payment-modal";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import SalesTimelineModal from "@/components/modals/sales-timeline-modal";
import OrderPrinter from "@/components/print/order/order-printer";
import CostBreakdown from "@/components/sales/overview/cost-breakdown";
import OverviewDetailsSection from "@/components/sales/overview/details-section";
import PaymentHistory from "@/components/sales/overview/payment-history";
import TabbedItemEmailOverview from "@/components/sales/overview/tabbed-item-email-overview";
import Timeline from "@/components/sales/overview/timeline";
import { DataPageShell } from "@/components/shells/data-page-shell";
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
        <BreadLink isFirst title="Sales" />
        <BreadLink title="Orders" />
        <OrderViewCrumb slug={order.orderId} isLast />
      </Breadcrumbs>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex flex-col space-y-4">
          <OverviewDetailsSection />
          {/* <ItemDetailsSection /> */}
          <TabbedItemEmailOverview />
        </div>
        <div className="space-y-4">
          <CostBreakdown />
          <PaymentHistory />
          <Timeline />
        </div>
      </div>
      <SalesProductionModal />
      <SalesTimelineModal />
      <SalesPaymentModal />
      <OrderPrinter />
    </DataPageShell>
  );
}
