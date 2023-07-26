import { ISalesWizard } from "@/types/IPost";
import { WizardKvForm } from "@/types/ISales";

interface ComposeItemDescriptionProps {
  wizard: ISalesWizard;
  kvForm: WizardKvForm;
}
export function composeItemDescription({
  wizard,
  kvForm,
}: ComposeItemDescriptionProps) {
  let description = wizard.titleMarkdown;
  console.log("MARKDOWN:", description);
  console.log(kvForm);
  wizard.form.map((f) => {
    let fv = kvForm[f.uuid];
    console.log(fv);
    let title = fv?.title || f?.defaultPrintValue || "";
    description = description.replace(`@${f.label}`, title);
  });
  description = description.replace(/^\||\|$/g, "");
  description = description.replace(/\|\s*\|/g, "|");
  description = description.replace(/\|\s*$/g, "");

  return description;
}
