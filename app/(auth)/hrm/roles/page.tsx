import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import HrmLayout from "@/components/tab-layouts/hrm-layout";

import { getProfiles } from "@/app/_actions/hrm/employee-profiles";
import EmployeeProfileTableShell from "@/components/shells/employee-profile-table-shell";
import EmployeeProfileModal from "@/components/modals/employee-profile-modal";
import { queryParams } from "@/app/_actions/action-utils";
import { _getRoles } from "@/app/_actions/hrm/roles.crud";
import RolesTableShell from "@/components/shells/roles-table-shell";
import RoleModal from "@/components/modals/role-modal";

export const metadata: Metadata = {
  title: "Roles",
};
export default async function EmployeesPage({ searchParams }) {
  const response = await _getRoles(queryParams(searchParams));
  return (
    <HrmLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Hrm" />
        <BreadLink isLast title="Roles" />
      </Breadcrumbs>
      <PageHeader title="Roles" newDialog="role" />
      <RolesTableShell {...response} />
      <RoleModal />
    </HrmLayout>
  );
}
