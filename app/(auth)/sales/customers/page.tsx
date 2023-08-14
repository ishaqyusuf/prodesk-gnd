import { queryParams } from "@/app/_actions/action-utils";

import { getCustomersAction } from "@/app/_actions/sales/sales-customers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import CustomerModal from "@/components/modals/customer-modal";
import PageHeader from "@/components/page-header";
import CustomersTableShell from "@/components/shells/customers-table-shell";
import { ICustomer } from "@/types/customers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};
interface Props {}
export default async function CustomersPage({ searchParams }) {
  const response = await getCustomersAction(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Sales" />
        <BreadLink isLast title="Customers" />
      </Breadcrumbs>
      <PageHeader title="Customers" newDialog="customerForm" />
      <CustomersTableShell<ICustomer> {...response} />
      <CustomerModal />
    </div>
  );
}
