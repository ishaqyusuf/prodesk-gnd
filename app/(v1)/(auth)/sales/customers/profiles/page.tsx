import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { getProfiles } from "@/app/(v1)/_actions/hrm/employee-profiles";
import EmployeeProfileTableShell from "@/components/_v1/shells/employee-profile-table-shell";

import CustomersLayout from "@/components/_v1/tab-layouts/customers-layout";
import CustomerProfileModal from "@/components/_v1/modals/customer-profile-modal";
import { getCustomerProfiles } from "@/app/(v1)/_actions/sales/sales-customer-profiles";
import CustomerProfileTableShell from "@/components/_v1/shells/customer-profile-table-shell";

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
            <CustomerProfileTableShell
                searchParams={searchParams}
                {...response}
            />
            <CustomerProfileModal />
        </CustomersLayout>
    );
}
