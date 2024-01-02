import { ISalesSetting } from "@/types/post";
import SalesSettings from "./SalesSettings";
import { getSettingAction } from "@/app/(v1)/_actions/settings";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

export const metadata = {
    title: "Sales Settings",
    description: "",
};
export default async function SalesSettingsPage({ searchParams }) {
    const resp = await getSettingAction<ISalesSetting>("sales-settings");

    if (!resp) return null;
    return (
        <div>
            <Breadcrumbs>
                <BreadLink isFirst title="Settings" />
                <BreadLink isLast title="Sales" />
            </Breadcrumbs>
            <SalesSettings data={resp} />
        </div>
    );
}