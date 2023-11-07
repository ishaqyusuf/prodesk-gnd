import { queryParams } from "@/app/_actions/action-utils";
import { _getCommunityJobTasks } from "@/app/_actions/community-job/_assign-jobs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import AssignTaskModal from "@/components/modals/assign-task-modal";
import VerifyTaskJobsBeforeAssign from "@/components/modals/community/verify-task-jobs-before-assign-modal";
import PageHeader from "@/components/page-header";
import CommunityTaskTableShell from "@/components/shells/community-tasks-table-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Assign Tasks"
};

export default async function AssignJobsPage({ searchParams }) {
    const response = await _getCommunityJobTasks(
        queryParams({
            ...searchParams
        })
    );

    return (
        <div className="space-y-4 px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Contractor" />
                {/* <BreadLink link="/contractor/" title="Projects" /> */}
                <BreadLink title="Assign Tasks" isLast />
            </Breadcrumbs>
            <PageHeader title={"Assign Task"} subtitle={``} />
            <CommunityTaskTableShell
                searchParams={searchParams}
                data={response.data as any}
                pageInfo={response.pageInfo}
            />
            <AssignTaskModal />
            <VerifyTaskJobsBeforeAssign />
        </div>
    );
}
