import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { queryParams } from "@/app/(v1)/_actions/action-utils";

import { getMyJobs } from "@/app/(v1)/_actions/hrm-jobs/get-jobs";
import JobTableShell from "@/components/_v1/shells/job-table-shell";
import JobOverviewSheet from "@/components/_v1/sheets/job-overview-sheet";
import EditJobModal from "@/components/_v1/modals/edit-job";

import SubmitJobBtn from "@/app/(v2)/(loggedIn)/contractors/_components/submit-job-btn";

import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";

export const metadata: Metadata = {
    title: "Installations",
};
export default async function TaskInstallationPage({ searchParams }) {
    const response = await getMyJobs(queryParams(searchParams));
    return (
        <AuthGuard
            can={[["viewInstallation", "viewDecoShutterInstall", "viewTech"]]}
        >
            <div className="space-y-4 flex flex-col">
                <Breadcrumbs>
                    <BreadLink isLast title="Jobs" />
                </Breadcrumbs>
                <PageHeader
                    title="Jobs"
                    // newDialog="submitJob"
                    // Action={TaskAction}
                    Action={SubmitJobBtn}
                />
                <JobTableShell searchParams={searchParams} {...response} />
                <JobOverviewSheet />
                <EditJobModal />
                {/* <SubmitJobModal /> */}
            </div>
        </AuthGuard>
    );
}
