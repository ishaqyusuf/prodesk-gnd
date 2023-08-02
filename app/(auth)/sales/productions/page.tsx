import { getSalesOrder } from "@/app/_actions/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionTableShell from "@/components/shells/sales-production-table-shell";
import { getSalesProductionsAction } from "@/app/_actions/sales-production";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductionsCrumb } from "@/components/breadcrumbs/links";

interface Props {}
export default async function SalesProductionPage({ searchParams }) {
  const response = await getSalesProductionsAction(queryParams(searchParams));
  return (
    <>
      <Breadcrumbs>
        <ProductionsCrumb />
      </Breadcrumbs>
      <div className="space-y-4 px-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Productions</h2>
          </div>
          <div className="flex items-center space-x-2"></div>
        </div>
        <SalesProductionTableShell<ISalesOrder> {...response} />
        <OrderPrinter />
      </div>
    </>
  );
}
