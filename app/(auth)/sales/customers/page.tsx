import { queryParams } from "@/app/_actions/action-utils";

import { getCustomersAction } from "@/app/_actions/sales-customers";
import CustomersTableShell from "@/components/shells/customers-table-shell";
import { ICustomer } from "@/types/customers";

interface Props {}
export default async function CustomersPage({ searchParams }) {
  const response = await getCustomersAction(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        </div>
        <div className="flex items-center space-x-2"></div>
      </div>
      <CustomersTableShell<ICustomer> {...response} />
    </div>
  );
}
