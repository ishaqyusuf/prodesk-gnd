import CommunitySettingsLayoutComponent from "@/components/_v1/tab-layouts/community-settings-layout";
import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import BuildersTableShell from "@/components/_v1/shells/builders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { getBuildersAction } from "@/app/(v1)/_actions/community/builders";
import BuilderModal from "@/components/_v1/modals/builder-modal";
import AuthGuard from "@/components/_v1/auth-guard";

export const metadata: Metadata = {
    title: "Builders",
};
export default async function BuildersPage({ searchParams }) {
    const response = await getBuildersAction(queryParams(searchParams));
    return (
        <AuthGuard can={["viewBuilders"]}>
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
        </AuthGuard>
    );
}
