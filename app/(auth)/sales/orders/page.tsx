import { getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Sales Orders",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesOrder(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <PageHeader title="Sales Orders" newLink="/sales/order/new/form" />
      <OrdersTableShell<ISalesOrder> {...response} />
      <OrderPrinter />
      <SalesProductionModal />
    </div>
  );
}
