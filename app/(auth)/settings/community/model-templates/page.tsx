import CommunitySettingsLayoutComponent from "@/components/settings/community/community-settings-layout";
import CommunitySettingsLayout from "../layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import BuildersTableShell from "@/components/shells/builders-table-shell";
import { IBuilder } from "@/types/community";
import { queryParams } from "@/app/_actions/action-utils";
import { getBuildersAction } from "@/app/_actions/community/builders";
import { getHomeTemplates } from "@/app/_actions/community/home-template";
import HomeTemplatesTableShell from "@/components/shells/home-templates-table-shell";

export const metadata: Metadata = {
  title: "Builders",
};
export default async function ModelTemplatesPage({ searchParams }) {
  const response = await getHomeTemplates(queryParams(searchParams));
  return (
    <CommunitySettingsLayoutComponent>
      <Breadcrumbs>
        <BreadLink isFirst title="Settings" />
        <BreadLink title="Community" />
        <BreadLink isLast title="Model Templates" />
      </Breadcrumbs>
      <PageHeader title="Model Templates" newDialog="modelTemplate" />
      <HomeTemplatesTableShell {...response} />
    </CommunitySettingsLayoutComponent>
  );
}
