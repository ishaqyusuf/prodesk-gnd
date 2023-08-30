import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { queryParams } from "@/app/_actions/action-utils";
import { getHomeTemplates } from "@/app/_actions/community/home-template";
import ModelCostTableShell from "@/components/shells/model-costs-table-shell";
import ModelCostModal from "@/components/modals/model-cost-modal";
import ModelTemplateModal from "@/components/modals/model-template-modal";

export const metadata: Metadata = {
  title: "Model Costs",
};
export default async function CommunityTemplatesPage({ searchParams }) {
  const response = await getHomeTemplates(queryParams(searchParams));
  return (
    <CommunitySettingsLayoutComponent>
      <Breadcrumbs>
        <BreadLink isFirst title="Settings" />
        <BreadLink title="Community" />
        <BreadLink isLast title="Model Costs" />
      </Breadcrumbs>
      <PageHeader title="Model Costs" newDialog="modelTemplate" />
      <ModelCostTableShell {...response} />
      <ModelCostModal />
      <ModelTemplateModal />
    </CommunitySettingsLayoutComponent>
  );
}
