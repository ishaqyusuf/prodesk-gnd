import { getHomeTemplate } from "@/app/_actions/community/home-template";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import ModelForm from "@/components/forms/model-form/model-form";
import PageHeader from "@/components/page-header";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Model Template",
};

export default async function ModelTemplatePage({ params }) {
  const response = await getHomeTemplate(params.slug);

  return (
    <DataPageShell
      data={{
        community: false,
      }}
      className="space-y-4 px-8"
    >
      <Breadcrumbs>
        <BreadLink isFirst title="Settings" />
        <BreadLink title="Community" />
        <BreadLink
          link="/settings/community/model-templates"
          title="Model Templates"
        />
        <BreadLink title={response.modelName} isLast />
      </Breadcrumbs>

      <ModelForm data={response as any} />
    </DataPageShell>
  );
}
