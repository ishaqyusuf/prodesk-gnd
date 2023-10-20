import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { queryParams } from "@/app/_actions/action-utils";
import { getCommunityTemplates } from "@/app/_actions/community/home-template";

import CommunityTemplateTableShell from "@/components/shells/community-templates-table-shell";
import ModelTemplateModal from "@/components/modals/model-template-modal";
import ModelInstallCostModal from "@/components/modals/model-install-cost-modal";

import ModelCostModal from "@/components/modals/model-cost-modal";
import {
    _bootstrapPivot,
    _createMissingPivots
} from "@/app/_actions/community/_community-pivot";

export const metadata: Metadata = {
    title: "Community Templates"
};
export default async function CommunityTemplatesPage({ searchParams }) {
    const response = await getCommunityTemplates(queryParams(searchParams));
    await _createMissingPivots();
    return (
        <CommunitySettingsLayoutComponent>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink title="Community" />
                <BreadLink isLast title="Community Templates" />
            </Breadcrumbs>
            <PageHeader
                title="Community Templates"
                newDialog="communityTemplate"
            />
            <CommunityTemplateTableShell
                searchParams={searchParams}
                {...response}
            />
            <ModelTemplateModal formType="communityTemplate" />
            <ModelInstallCostModal community />
            <ModelCostModal community />
            {/* <ModelCostCommunityModal /> */}
        </CommunitySettingsLayoutComponent>
    );
}
