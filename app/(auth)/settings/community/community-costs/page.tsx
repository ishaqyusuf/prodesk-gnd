import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { queryParams } from "@/app/_actions/action-utils";

import ProjectsTableShell from "@/components/shells/projects-table-shell";
import { getProjectsAction } from "@/app/_actions/community/projects";
import CommunityInstallCostModal from "@/components/modals/community-install-cost";

export const metadata: Metadata = {
    title: "Community Costs"
};
export default async function CommunityTemplatesPage({ searchParams }) {
    const response = await getProjectsAction(queryParams(searchParams));
    return (
        <CommunitySettingsLayoutComponent>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink title="Community" />
                <BreadLink isLast title="Community Cost" />
            </Breadcrumbs>
            <PageHeader title="Community Costs" />

            <ProjectsTableShell
                cost
                searchParams={searchParams}
                {...response}
            />
            <CommunityInstallCostModal />
        </CommunitySettingsLayoutComponent>
    );
}
