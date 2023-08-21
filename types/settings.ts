import { Settings } from "@prisma/client";

export type InstallCostSettings = Settings & {
  meta: InstallCostMeta;
};
export interface InstallCostMeta {
  list: {
    defaultQty;
    id;
    title;
    cost;
  }[];
}

export type SettingType = "sales-settings" | "install-price-chart";
