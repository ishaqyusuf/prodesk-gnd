import CommunitySettingsLayoutComponent from "@/components/_v1/tab-layouts/community-settings-layout";
import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { getCommunityTemplates } from "@/app/(v1)/_actions/community/home-template";

import CommunityTemplateTableShell from "@/components/_v1/shells/community-templates-table-shell";
import ModelTemplateModal from "@/components/_v1/modals/model-template-modal";
import ModelInstallCostModal from "@/app/(v1)/(auth)/settings/community/community-templates/install-cost-modal/model-install-cost-modal";

import {
    _addMissingPivotToModelCosts,
    _bootstrapPivot,
    _createMissingPivots,
} from "@/app/(v1)/_actions/community/_community-pivot";
import CommunityModelCostModal from "@/components/_v1/modals/community-model-cost/modal";
import CommunityInstallCostModal from "@/components/_v1/modals/community-install-cost";
import { _synchronizePivot } from "@/app/(v2)/(loggedIn)/community-settings/community-templates/_actions/synchronize-pivots";

export const metadata: Metadata = {
    title: "Community Templates",
};
export default async function CommunityTemplatesPage({ searchParams }) {
    const response = await getCommunityTemplates(queryParams(searchParams));

    // await _createMissingPivots();
    // await _addMissingPivotToModelCosts();
    // await _synchronizePivot();
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
            <CommunityModelCostModal />
            <CommunityInstallCostModal />
            {/* <ModelCostCommunityModal /> */}
        </CommunitySettingsLayoutComponent>
    );
}