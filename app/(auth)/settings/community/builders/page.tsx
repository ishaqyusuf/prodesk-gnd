import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import BuildersTableShell from "@/components/shells/builders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { getBuildersAction } from "@/app/_actions/community/builders";
import BuilderModal from "@/components/modals/builder-modal";

export const metadata: Metadata = {
  title: "Builders",
};
export default async function BuildersPage({ searchParams }) {
  const response = await getBuildersAction(queryParams(searchParams));
  return (
    <CommunitySettingsLayoutComponent>
      <Breadcrumbs>
        <BreadLink isFirst title="Settings" />
        <BreadLink title="Community" />
        <BreadLink isLast title="Builders" />
      </Breadcrumbs>
      <PageHeader title="Builders" newDialog="builder" />
      <BuildersTableShell searchParams={searchParams} {...response} />
      <BuilderModal />
    </CommunitySettingsLayoutComponent>
  );
}
