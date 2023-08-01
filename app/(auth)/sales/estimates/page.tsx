import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";

interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesEstimates(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estimates</h2>
        </div>
        <div className="flex items-center space-x-2"></div>
      </div>
      <EstimatesTableShell<ISalesOrder> {...response} />
      <OrderPrinter />
    </div>
  );
}
