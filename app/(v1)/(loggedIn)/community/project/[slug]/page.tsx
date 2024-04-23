import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/_v1/page-header";
import { ExtendedHome, IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import ProjectsTableShell from "@/components/_v1/shells/homes-table-shell";
import { getProjectsAction } from "@/app/(v1)/_actions/community/projects";
import ProjectModal from "@/components/_v1/modals/project-modal";
import { getProjectHomesAction } from "@/app/(v1)/_actions/community/home";
import HomesTableShell from "@/components/_v1/shells/homes-table-shell";
import HomeModal from "@/components/_v1/modals/home-modal";
import { openModal } from "@/lib/modal";
import AuthGuard from "@/components/_v1/auth-guard";

export const metadata: Metadata = {
    title: "Projects",
};
interface Props {}
export default async function ProjectHomesPage({ searchParams, params }) {
    const { project, ...response } = (await getProjectHomesAction(
        queryParams({ ...searchParams, _projectSlug: params.slug })
    )) as any;
    metadata.title = `${project.title} | Homes`;

    return (
        <AuthGuard can={["viewProject"]}>
            <div className="space-y-4 px-8">
                <Breadcrumbs>
                    <BreadLink isFirst title="Community" />
                    <BreadLink link="/community/projects" title="Projects" />
                    <BreadLink link="/community/units" title="All Units" />
                    <BreadLink title={project.title} isLast />
                </Breadcrumbs>
                <PageHeader
                    title={project.title}
                    subtitle={project?.builder?.name}
                    newDialog="home"
                    modalData={{ projectId: project.id }}
                />
                <HomesTableShell<ExtendedHome>
                    projectView
                    data={response.data as any}
                    pageInfo={response.pageInfo}
                />

                <HomeModal />
            </div>
        </AuthGuard>
    );
}
