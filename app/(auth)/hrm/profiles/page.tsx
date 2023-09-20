import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import HrmLayout from "@/components/tab-layouts/hrm-layout";

import { getProfiles } from "@/app/_actions/hrm/employee-profiles";
import EmployeeProfileTableShell from "@/components/shells/employee-profile-table-shell";
import EmployeeProfileModal from "@/components/modals/employee-profile-modal";
import { queryParams } from "@/app/_actions/action-utils";

export const metadata: Metadata = {
  title: "Employee Profiles",
};
export default async function EmployeesPage({ searchParams }) {
  const response = await getProfiles(queryParams(searchParams));
  return (
    <HrmLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Hrm" />
        <BreadLink isLast title="Employee Profiles" />
      </Breadcrumbs>
      <PageHeader title="Employee Profiles" newDialog="employeeProfile" />
      <EmployeeProfileTableShell searchParams={searchParams} {...response} />
      <EmployeeProfileModal />
    </HrmLayout>
  );
}
