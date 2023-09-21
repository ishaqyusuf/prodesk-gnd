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
import { getSalesDelivery } from "@/app/_actions/sales/sales-delivery";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Order Delivery",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesDelivery(queryParams(searchParams));
  return (
    <SalesTabLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Sales" />
        <BreadLink isLast title="Delivery" />
      </Breadcrumbs>
      <PageHeader title="Sales Delivery" />
      <DeliveryTableShell<ISalesOrder>
        searchParams={searchParams}
        {...response}
      />
      <OrderPrinter />
    </SalesTabLayout>
  );
}
