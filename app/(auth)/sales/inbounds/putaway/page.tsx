import { queryParams } from "@/app/_actions/action-utils";
import { getPutwaysAction } from "@/app/_actions/sales-inbound/putaway.crud";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import PageHeader from "@/components/page-header";
import PutawayTableShell from "@/components/shells/putaway-table-shell";
import InboundLayout from "@/components/tab-layouts/inbound-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbounds",
};
export default async function PutawayPage({ searchParams }) {
  const response = await getPutwaysAction(queryParams(searchParams));
  return (
    <InboundLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Inbounds" />
        <BreadLink isLast title="Inbound Orders" />
      </Breadcrumbs>
      <PageHeader title="Putaways" />
      <PutawayTableShell searchParams={searchParams} {...response} />
    </InboundLayout>
  );
}
