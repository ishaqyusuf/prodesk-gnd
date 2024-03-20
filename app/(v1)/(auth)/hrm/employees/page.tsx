import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { queryParams } from "@/app/(v1)/_actions/action-utils";

import HrmLayout from "@/components/_v1/tab-layouts/hrm-layout";
import EmployeesTableShell from "@/app/(v1)/(auth)/hrm/employees/employees-table-shell";
import { getEmployees } from "@/app/(v1)/_actions/hrm/get-employess";
import EmployeeModal from "@/components/_v1/modals/employee-modal";

export const metadata: Metadata = {
    title: "Employees",
};
export default async function EmployeesPage({ searchParams }) {
    const response = await getEmployees(queryParams(searchParams));

    return (
        <HrmLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Hrm" />
                <BreadLink isLast title="Employees" />
            </Breadcrumbs>

            <EmployeesTableShell searchParams={searchParams} {...response} />
            <EmployeeModal />
        </HrmLayout>
    );
}
