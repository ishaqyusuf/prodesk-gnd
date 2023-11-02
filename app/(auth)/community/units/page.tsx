import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { ExtendedHome, IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { getHomesAction } from "@/app/_actions/community/home";
import HomesTableShell from "@/components/shells/homes-table-shell";
import HomeModal from "@/components/modals/home-modal";
import ActivateProductionModal from "@/components/modals/activate-production-modal";
import { _addLotBlocks } from "@/app/_actions/community/units/_add-lotblocks";

export const metadata: Metadata = {
    title: "All Units"
};
interface Props {}
export default async function HomesPage({ searchParams, params }) {
    const response = await getHomesAction(
        queryParams({ ...searchParams, _projectSlug: params.slug })
    );
    await _addLotBlocks();
    // console.log(response.data[0]?.search);
    // metadata.title = `${project.title} | Homes`;

    return (
        <div className="space-y-4 px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Community" />
                <BreadLink link="/community/projects" title="Projects" />
                <BreadLink link="/community/units" title="All Units" isLast />
            </Breadcrumbs>
            <PageHeader title={"Units"} subtitle={``} newDialog="home" />
            <HomesTableShell<ExtendedHome>
                projectView={false}
                data={response.data as any}
                searchParams={searchParams}
                pageInfo={response.pageInfo}
            />
            <HomeModal />
            <ActivateProductionModal />
        </div>
    );
}
