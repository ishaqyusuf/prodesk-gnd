import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import HrmLayout from "@/components/tab-layouts/hrm-layout";
import { getJobs } from "@/app/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/shells/job-table-shell";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import EditJobModal from "@/components/modals/edit-job";
import SubmitJobModal from "@/components/modals/submit-job-modal";

export const metadata: Metadata = {
  title: "Employees",
};
export default async function EmployeesPage({ searchParams }) {
  const response = await getJobs(queryParams(searchParams));
  return (
    <HrmLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Hrm" />
        <BreadLink isLast title="Jobs" />
      </Breadcrumbs>
      <PageHeader title="Jobs" newDialog="submitJob" />
      <JobTableShell adminMode {...response} />
      <JobOverviewSheet />
      <EditJobModal />
      <SubmitJobModal />
    </HrmLayout>
  );
}
