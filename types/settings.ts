import { Settings } from "@prisma/client";
import { OmitMeta } from "./type";

export type InstallCostSettings = OmitMeta<Settings> & {
  meta: InstallCostMeta;
};
export interface InstallCostMeta {
  list: InstallCostLine[];
}
export interface InstallCostLine {
  defaultQty;
  id;
  title;
  cost;
  uid?;
}
export type SettingType = "sales-settings" | "install-price-chart";
