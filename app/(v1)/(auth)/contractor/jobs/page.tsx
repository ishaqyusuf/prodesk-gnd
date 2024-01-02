import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { queryParams } from "@/app/(v1)/_actions/action-utils";

import { getJobs } from "@/app/(v1)/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/_v1/shells/job-table-shell";
import JobOverviewSheet from "@/components/_v1/sheets/job-overview-sheet";
import EditJobModal from "@/components/_v1/modals/edit-job";
import SubmitJobModal from "@/app/(v1)/(auth)/tasks/submit-job/submit-job-modal";
import TabbedLayout from "@/components/_v1/tab-layouts/tabbed-layout";

export const metadata: Metadata = {
    title: "Jobs",
};
export default async function EmployeesPage({ searchParams }) {
    const response = await getJobs(queryParams(searchParams));

    return (
        <TabbedLayout tabKey="Job">
            <Breadcrumbs>
                <BreadLink isFirst title="Hrm" />
                <BreadLink isLast title="Jobs" />
            </Breadcrumbs>
            <PageHeader
                title="Jobs"
                newDialog="submitJob"
                modalData={{
                    defaultTab: "user",
                    data: { type: "installation" },
                }}
            />
            <JobTableShell
                adminMode
                searchParams={searchParams}
                {...response}
            />
            <JobOverviewSheet />
            <EditJobModal />
            <SubmitJobModal admin />
        </TabbedLayout>
    );
}