import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import HrmLayout from "@/components/hrm/hrm-layout";
import EmployeesTableShell from "@/components/shells/employees-table-shell";
import { getEmployees } from "@/app/_actions/hrm/get-employess";
import EmployeeModal from "@/components/modals/employee-modal";
import { getProfiles } from "@/app/_actions/hrm/employee-profiles";
import EmployeeProfileTableShell from "@/components/shells/employee-profile-table-shell";
import EmployeeProfileModal from "@/components/modals/employee-profile-modal";

export const metadata: Metadata = {
  title: "Employee Profiles",
};
export default async function EmployeesPage({ searchParams }) {
  const response = await getProfiles();
  return (
    <HrmLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Hrm" />
        <BreadLink isLast title="Employee Profiles" />
      </Breadcrumbs>
      <PageHeader title="Employee Profiles" newDialog="employeeProfile" />
      <EmployeeProfileTableShell {...response} />
      <EmployeeProfileModal />
    </HrmLayout>
  );
}
