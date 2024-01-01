import CommunitySettingsLayoutComponent from "@/components/_v1/tab-layouts/community-settings-layout";
import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { getHomeTemplates } from "@/app/(v1)/_actions/community/home-template";
import ModelCostTableShell from "@/components/_v1/shells/model-costs-table-shell";
import ModelCostModal from "@/components/_v1/modals/model-cost-modal";
import ModelInstallCostModal from "@/app/(v1)/(auth)/settings/community/community-templates/install-cost-modal/model-install-cost-modal";

export const metadata: Metadata = {
    title: "Model Costs",
};
export default async function ModelCosts({ searchParams }) {
    const response = await getHomeTemplates(queryParams(searchParams));
    return (
        <CommunitySettingsLayoutComponent>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink title="Community" />
                <BreadLink isLast title="Model Costs" />
            </Breadcrumbs>
            <PageHeader title="Model Costs" newDialog="modelTemplate" />
            <ModelCostTableShell searchParams={searchParams} {...response} />
            <ModelCostModal />
            {/* <ModelTemplateModal /> */}
            <ModelInstallCostModal />
        </CommunitySettingsLayoutComponent>
    );
}
