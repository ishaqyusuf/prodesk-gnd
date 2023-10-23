import { getSettingAction } from "@/app/_actions/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { InstallCostForm } from "@/components/forms/community/install-cost-form";
import CommunitySettingsLayoutComponent from "@/components/tab-layouts/community-settings-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Install Costs"
};
export default async function InstallCostsPage({}) {
    const data = await getSettingAction("install-price-chart");
    return (
        <CommunitySettingsLayoutComponent>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink title="Community" />
                <BreadLink isLast title="Install Cost" />
            </Breadcrumbs>
            <InstallCostForm data={data as any} />
        </CommunitySettingsLayoutComponent>
    );
}
