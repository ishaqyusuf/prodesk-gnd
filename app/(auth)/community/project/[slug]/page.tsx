import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { ExtendedHome, IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import ProjectsTableShell from "@/components/shells/homes-table-shell";
import { getProjectsAction } from "@/app/_actions/community/projects";
import ProjectModal from "@/components/modals/project-modal";
import { getProjectHomesAction } from "@/app/_actions/community/home";
import HomesTableShell from "@/components/shells/homes-table-shell";

export const metadata: Metadata = {
  title: "Projects",
};
interface Props {}
export default async function ProjectHomesPage({ searchParams, params }) {
  const { project, ...response } = await getProjectHomesAction(
    queryParams({ ...searchParams, _projectSlug: params.slug })
  );
  metadata.title = `${project.title} | Homes`;

  return (
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
      />
      <HomesTableShell<ExtendedHome>
        projectView
        data={response.data as any}
        pageInfo={response.pageInfo}
      />
      <ProjectModal />
    </div>
  );
}
