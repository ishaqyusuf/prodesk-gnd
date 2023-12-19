import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import { getMyJobs } from "@/app/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/shells/job-table-shell";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import EditJobModal from "@/components/modals/edit-job";
import SubmitJobModal from "@/app/(auth)/tasks/submit-job/submit-job-modal";
import TaskAction from "@/components/tasks/task-action";

export const metadata: Metadata = {
    title: "Installations",
};
export default async function PunchoutPage({ searchParams }) {
    const response = await getMyJobs(
        queryParams(searchParams, { type: "punchout" })
    );
    return (
        <div className="space-y-4 flex flex-col">
            <Breadcrumbs>
                <BreadLink isLast title="Jobs" />
            </Breadcrumbs>
            <PageHeader title="Jobs" Action={TaskAction} />
            <JobTableShell searchParams={searchParams} {...response} />
            <JobOverviewSheet />
            <EditJobModal />
            <SubmitJobModal />
        </div>
    );
}
