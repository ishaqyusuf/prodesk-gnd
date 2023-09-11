import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import { getMyJobs } from "@/app/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/shells/job-table-shell";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import EditJobModal from "@/components/modals/edit-job";
import SubmitJobModal from "@/components/modals/submit-job-modal";

export const metadata: Metadata = {
  title: "Installations",
};
export default async function TaskInstallationPage({ searchParams }) {
  const response = await getMyJobs(queryParams(searchParams));
  return (
    <div className="space-y-4 flex flex-col">
      <Breadcrumbs>
        <BreadLink isLast title="Jobs" />
      </Breadcrumbs>
      <PageHeader title="Jobs" newDialog="submitJob" />
      <JobTableShell {...response} />
      <JobOverviewSheet />
      <EditJobModal />
      <SubmitJobModal />
    </div>
  );
}
