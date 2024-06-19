import { getCommunityTemplate } from "@/app/(v1)/_actions/community/home-template";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import ModelForm from "@/components/_v1/forms/model-form/model-form";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { transformCommunityTemplate } from "@/lib/community/community-template";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Community Template",
};

export default async function CommunityModelTemplatePage({ params }) {
    const response: any = await getCommunityTemplate(params.slug);
    console.log({ ...(response.meta.design ?? {}) });

    if (response.meta?.design) {
        response.meta.design = transformCommunityTemplate(response.meta.design);
    }
    return (
        <AuthGuard can={["editProject"]}>
            <DataPageShell
                data={{
                    community: true,
                }}
                className="space-y-4 px-8"
            >
                <Breadcrumbs>
                    <BreadLink isFirst title="Settings" />
                    <BreadLink title="Community" />
                    <BreadLink
                        link="/settings/community/community-templates"
                        title="Community Templates"
                    />
                    <BreadLink title={response.modelName} isLast />
                </Breadcrumbs>

                <ModelForm
                    title="Edit Community Model"
                    data={response as any}
                />
            </DataPageShell>
        </AuthGuard>
    );
}
