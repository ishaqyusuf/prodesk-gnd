import { getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/components/shells/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionModal from "@/components/modals/sales-production-modal";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import ProjectsTableShell from "@/components/shells/projects-table-shell";
import { getProjectsAction } from "@/app/_actions/community/projects";
import ProjectModal from "@/components/modals/project-modal";

export const metadata: Metadata = {
  title: "Projects",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getProjectsAction(queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Community" />
        <BreadLink isLast title="Projects" />
      </Breadcrumbs>
      <PageHeader title="Projects" newDialog="project" />
      <ProjectsTableShell<IProject> {...response} />
      <ProjectModal />
    </div>
  );
}
