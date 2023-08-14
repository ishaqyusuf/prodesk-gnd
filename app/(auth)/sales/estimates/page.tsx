import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";
import PageHeader from "@/components/page-header";

interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesEstimates(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <PageHeader title="Sales Estimates" newLink="/sales/estimate/new/form" />
      <EstimatesTableShell<ISalesOrder> {...response} />
      <OrderPrinter />
    </div>
  );
}
