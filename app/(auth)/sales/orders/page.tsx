import { getSalesOrder } from "@/app/_actions/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";

interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getSalesOrder(queryParams(searchParams));
  return (
    <div>
      <OrdersTableShell<ISalesOrder> {...response} />{" "}
    </div>
  );
}
