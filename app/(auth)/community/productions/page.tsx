import { queryParams } from "@/app/_actions/action-utils";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { getHomesAction } from "@/app/_actions/community/home";
import CommunityInvoiceTableShell from "@/components/shells/community-invoice-table-shell";
import { getInvoices } from "@/app/_actions/community-invoice/get-invoices";
import EditInvoiceModal from "@/components/modals/edit-invoice-modal";
import CommunityProductionsTableShell from "@/components/shells/community-productions";
import { getProductions } from "@/app/_actions/community-production/get-productions";

export const metadata: Metadata = {
  title: "Unit Productions",
};
interface Props {}
export default async function InvoicesPage({ searchParams, params }) {
  const response = await getProductions(queryParams({ ...searchParams }));
  // metadata.title = `${project.title} | Homes`;

  return (
    <div className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst title="Community" />
        <BreadLink link="/community/projects" title="Projects" />
        <BreadLink title="Productions" isLast />
      </Breadcrumbs>
      <PageHeader title={"Unit Productions"} subtitle={``} />
      <CommunityProductionsTableShell
        data={response.data as any}
        pageInfo={response.pageInfo}
      />
    </div>
  );
}
