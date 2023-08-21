import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { IHome, IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import ProjectModal from "@/components/modals/project-modal";
import {
  getHomesAction,
  getProjectHomesAction,
} from "@/app/_actions/community/home";
import HomesTableShell from "@/components/shells/homes-table-shell";

export const metadata: Metadata = {
  title: "All Units",
};
interface Props {}
export default async function HomesPage({ searchParams, params }) {
  const response = await getHomesAction(
    queryParams({ ...searchParams, _projectSlug: params.slug })
  );
  // metadata.title = `${project.title} | Homes`;

  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Community" />
        <BreadLink link="/community/projects" title="Projects" />
        <BreadLink link="/community/units" title="All Units" isLast />
      </Breadcrumbs>
      <PageHeader title={"Units"} subtitle={``} newDialog="home" />
      <HomesTableShell<IHome>
        projectView={false}
        data={response.data as any}
        pageInfo={response.pageInfo}
      />
      <ProjectModal />
    </div>
  );
}
