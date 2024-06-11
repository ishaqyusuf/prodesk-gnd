import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { _mergeConflictCustomers } from "@/app/(v1)/_actions/fix/merge-conflict-customer";

import { getCustomersAction } from "@/app/(v1)/(loggedIn)/sales/_actions/sales-customers";
import AuthGuard from "@/components/_v1/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import CustomerModal from "@/components/_v1/modals/customer-modal";
import PageHeader from "@/components/_v1/page-header";
import CustomersLayout from "@/components/_v1/tab-layouts/customers-layout";
import { ICustomer } from "@/types/customers";
import { Metadata } from "next";
import CustomersTableShell from "./_components/customers-table-shell";

export const metadata: Metadata = {
    title: "Customers",
};
interface Props {}
export default async function CustomersPage({ searchParams }) {
    // await _mergeConflictCustomers();
    const response = getCustomersAction(queryParams(searchParams));

    return (
        <AuthGuard can={["viewSalesCustomers"]}>
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
                <CustomersTableShell
                    searchParams={searchParams}
                    promise={response}
                />
                <CustomerModal />
            </CustomersLayout>
        </AuthGuard>
    );
}
