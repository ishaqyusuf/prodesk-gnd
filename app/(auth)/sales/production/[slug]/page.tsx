import { getOrderAction } from "@/app/_actions/sales/sales";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  BreadLink,
  EstimatesCrumb,
  OrderViewCrumb,
  ProductionsCrumb,
} from "@/components/breadcrumbs/links";
import SalesPaymentModal from "@/components/modals/sales-payment-modal";
import SalesProdSubmitModal from "@/components/modals/sales-prod-submit-modal";
import SalesTimelineModal from "@/components/modals/sales-timeline-modal";
import OrderPrinter from "@/components/print/order/order-printer";
import OverviewDetailsSection from "@/components/sales/overview/details-section";
import ItemDetailsSection from "@/components/sales/overview/item-details";
import Timeline from "@/components/sales/overview/timeline";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { ISalesOrder } from "@/types/sales";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Sales Production",
  description: "Order Overview",
};
export default async function SalesOrderPage({ params: { slug } }) {
  const order: ISalesOrder = (await getOrderAction(slug)) as any;

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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col space-y-4">
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
