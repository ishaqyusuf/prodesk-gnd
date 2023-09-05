import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { IProject } from "@/types/community";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { getProjectsAction } from "@/app/_actions/community/projects";
import ProjectModal from "@/components/modals/project-modal";
import ProjectsTableShell from "@/components/shells/projects-table-shell";
import { getCustomerServices } from "@/app/_actions/customer-services/customer-services";
import CustomerServiceTableShell from "@/components/shells/customer-service-table-shell";
import CustomerServiceModal from "@/components/modals/customer-service-modal";

export const metadata: Metadata = {
  title: "Customer Services",
};
interface Props {}
export default async function OrdersPage({ searchParams }) {
  const response = await getCustomerServices(queryParams(searchParams));

  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Customer Services" />
      </Breadcrumbs>
      <PageHeader title="Customer Services" newDialog="customerServices" />
      <CustomerServiceTableShell<IProject> {...response} />
      <CustomerServiceModal />
    </div>
  );
}
