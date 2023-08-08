import { getSalesOrder } from "@/app/_actions/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Orders",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesOrder(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        </div>
        <div className="flex items-center space-x-2"></div>
      </div>
      <OrdersTableShell<ISalesOrder> {...response} />
      <OrderPrinter />
      <SalesProductionModal />
    </div>
  );
}
