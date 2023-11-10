import { queryParams } from "@/app/_actions/action-utils";
import { _mergeConflictCustomers } from "@/app/_actions/fix/merge-conflict-customer";

import { getCustomersAction } from "@/app/_actions/sales/sales-customers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import CustomerModal from "@/components/modals/customer-modal";
import PageHeader from "@/components/page-header";
import CustomersTableShell from "@/components/shells/customers-table-shell";
import CustomersLayout from "@/components/tab-layouts/customers-layout";
import { ICustomer } from "@/types/customers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customers"
};
interface Props {}
export default async function CustomersPage({ searchParams }) {
    await _mergeConflictCustomers();
    const response = await getCustomersAction(queryParams(searchParams));
    return (
        <CustomersLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Customers" />
            </Breadcrumbs>
            <PageHeader
                title="Customers"
                permissions={["editOrders"]}
                newDialog="customerForm"
            />
            <CustomersTableShell<ICustomer>
                searchParams={searchParams}
                {...response}
            />
            <CustomerModal />
        </CustomersLayout>
    );
}
