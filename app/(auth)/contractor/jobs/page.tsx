import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import { getJobs } from "@/app/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/shells/job-table-shell";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import EditJobModal from "@/components/modals/edit-job";
import SubmitJobModal from "@/components/modals/submit-job-modal";
import TabbedLayout from "@/components/tab-layouts/tabbed-layout";

export const metadata: Metadata = {
    title: "Jobs"
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
                    data: { type: "installation" }
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
