import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import CommunityProductionsTableShell from "@/components/shells/community-productions-table-shell";
import { getProductions } from "@/app/_actions/community-production/get-productions";
import { _taskNames } from "@/app/_actions/community/_task-names";

export const metadata: Metadata = {
    title: "Unit Productions",
};
interface Props {}
export default async function InvoicesPage({ searchParams, params }) {
    const taskNames = await _taskNames({
        produceable: true,
    } as any);
    // console.log(taskNames);
    const response = await getProductions(
        queryParams({ _task: taskNames, ...searchParams })
    );
    // metadata.title = `${project.title} | Homes`;

    return (
        <div className="space-y-4 px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Community" />
                <BreadLink link="/community/projects" title="Projects" />
                <BreadLink title="Productions" isLast />
            </Breadcrumbs>
            <PageHeader title={"Unit Productions"} subtitle={``} />
            <CommunityProductionsTableShell
                searchParams={searchParams}
                data={response.data as any}
                pageInfo={response.pageInfo}
            />
        </div>
    );
}
