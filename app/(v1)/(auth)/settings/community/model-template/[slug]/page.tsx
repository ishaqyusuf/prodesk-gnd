import { getHomeTemplate } from "@/app/(v1)/_actions/community/home-template";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import ModelForm from "@/components/_v1/forms/model-form/model-form";
import PageHeader from "@/components/_v1/page-header";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Model Template",
};

export default async function ModelTemplatePage({ params }) {
    const response = await getHomeTemplate(params.slug);
    console.log(response);
    return (
        <DataPageShell
            data={{
                community: false,
                ...response,
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
