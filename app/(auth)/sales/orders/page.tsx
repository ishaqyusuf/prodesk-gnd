import { getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import SalesTabLayout from "@/components/tab-layouts/sales-tab-layout";

export const metadata: Metadata = {
  title: "Sales Orders",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesOrder(queryParams(searchParams));
  console.log(response, searchParams);
  return (
    <SalesTabLayout query={searchParams}>
      <Breadcrumbs>
        <BreadLink isFirst title="Sales" />
        <BreadLink isLast title="Orders" />
      </Breadcrumbs>
      <PageHeader
        title="Sales Orders"
        newLink="/sales/order/new/form"
        permissions={["editOrders"]}
      />
      <OrdersTableShell<ISalesOrder> {...response} />
      <OrderPrinter />
      <SalesProductionModal />
    </SalesTabLayout>
  );
}
