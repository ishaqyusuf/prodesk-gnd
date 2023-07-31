import { Posts } from "@prisma/client";

export const PostTypes = {
  SALES_SETTINGS: "sales-settings",
  SWINGS: "swings",
  SUPPLIERS: "suppliers",
};
export type PostType = "sales-settings" | "swings" | "suppliers";
export type ISalesSetting = Posts & {
  meta: ISalesSettingMeta;
};
export interface ISalesSettingMeta {
  ccc;
  production_event;
  sales_margin;
  sales_profile;
  sales_profile_id;
  tax_percentage;

  defaultFrame;
  defaultHinge;
  defaultCasing;

  manualEstimate: Boolean;

  wizard: ISalesWizard;
}
export interface ISalesWizard {
  titleMarkdown; //@Door | @Qty | @xyz | @
  form: ISalesWizardForm[];
}
export type WizardInputType = "Option" | "Text" | "Checkbox";
export interface ISalesWizardForm {
  uuid;
  label;
  category;
  hasQty?: Boolean;
  inputType: WizardInputType;
  hasCost?;
  checkedValue?;
  depId?;
  uncheckedValue?;
  options?: string[];
  defaultQty?;
  defaultPrintValue?;
  deleted?: Boolean;
}
