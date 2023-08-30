import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import CommunitySettingsLayout from "../layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import BuildersTableShell from "@/components/shells/builders-table-shell";
import { IBuilder } from "@/types/community";
import { queryParams } from "@/app/_actions/action-utils";
import { getBuildersAction } from "@/app/_actions/community/builders";
import {
  getCommunityTemplates,
  getHomeTemplates,
} from "@/app/_actions/community/home-template";
import HomeTemplatesTableShell from "@/components/shells/home-templates-table-shell";
import CommunityTemplateTableShell from "@/components/shells/community-templates-table-shell";

export const metadata: Metadata = {
  title: "Community Templates",
};
export default async function CommunityTemplatesPage({ searchParams }) {
  const response = await getCommunityTemplates(queryParams(searchParams));
  return (
    <CommunitySettingsLayoutComponent>
      <Breadcrumbs>
        <BreadLink isFirst title="Settings" />
        <BreadLink title="Community" />
        <BreadLink isLast title="Community Templates" />
      </Breadcrumbs>
      <PageHeader title="Community Templates" newDialog="communityTemplate" />
      <CommunityTemplateTableShell {...response} />
    </CommunitySettingsLayoutComponent>
  );
}
