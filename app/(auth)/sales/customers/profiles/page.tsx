import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { getProfiles } from "@/app/_actions/hrm/employee-profiles";
import EmployeeProfileTableShell from "@/components/shells/employee-profile-table-shell";

import CustomersLayout from "@/components/tab-layouts/customers-layout";
import CustomerProfileModal from "@/components/modals/customer-profile-modal";
import { getCustomerProfiles } from "@/app/_actions/sales/sales-customer-profiles";
import CustomerProfileTableShell from "@/components/shells/customer-profile-table-shell";

export const metadata: Metadata = {
  title: "Employee Profiles",
};
export default async function CustomerProfilesPage({ searchParams }) {
  const response = await getCustomerProfiles();
  return (
    <CustomersLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Customers" link={"/customers"} />
        <BreadLink isLast title="Customer Profiles" />
      </Breadcrumbs>
      <PageHeader title="Customer Profiles" newDialog="customerProfile" />
      <CustomerProfileTableShell searchParams={searchParams} {...response} />
      <CustomerProfileModal />
    </CustomersLayout>
  );
}
