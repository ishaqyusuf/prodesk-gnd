import { ISalesSetting } from "@/types/post";
import SalesSettings from "./SalesSettings";
import { getSettingAction } from "@/app/_actions/settings";

export const metadata = {
  title: "Sales Settings",
  description: "",
};
export default async function SalesSettingsPage({ searchParams }) {
  const resp = await getSettingAction<ISalesSetting>("sales-settings");

  if (!resp) return null;
  return (
    <div>
      <SalesSettings data={resp} />
    </div>
  );
}
