import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import HrmLayout from "@/components/tab-layouts/hrm-layout";
import EmployeesTableShell from "@/components/shells/employees-table-shell";
import { getEmployees } from "@/app/_actions/hrm/get-employess";
import EmployeeModal from "@/components/modals/employee-modal";
import ContractorsTableShell from "@/components/shells/contractors-table-shell";

export const metadata: Metadata = {
    title: "Documents"
};
export default async function EmployeesPage({ searchParams }) {
    const response = await getEmployees(
        queryParams(searchParams, {
            role: "1099 Contractor"
        })
    );

    return (
        <div className="sm:px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Contactors" />
                {/* <BreadLink isLast title="Employees" /> */}
            </Breadcrumbs>
            <PageHeader title="Contractors" newDialog="employee" />
            <ContractorsTableShell searchParams={searchParams} {...response} />
            <EmployeeModal />
        </div>
    );
}
