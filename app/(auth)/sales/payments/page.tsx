import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { getsalesPayments } from "@/app/_actions/sales-payment/crud";
import SalesPaymentTableShell from "@/components/shells/sales-payment-table-shell";

interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getsalesPayments(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Sales" />
        <BreadLink isLast title="Payments" />
      </Breadcrumbs>
      <PageHeader
        title="Sales Payments"
        permissions={["editOrders"]}
        newLink="/sales/estimate/new/form"
      />
      <SalesPaymentTableShell {...response} />
      <OrderPrinter />
    </div>
  );
}
