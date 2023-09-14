import { queryParams } from "@/app/_actions/action-utils";
import { getInboundForm } from "@/app/_actions/sales-inbound/get-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import InboundForm from "@/components/forms/sales-inbound-order-form/inbound-form";
import PageHeader from "@/components/page-header";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Inbound",
};

export default async function InboundFormPage({
  params: { slug },
  searchParams,
}) {
  const response = await getInboundForm(slug, queryParams(searchParams));
  return (
    <div className="space-y-4 px-8">
      <DataPageShell>
        <Breadcrumbs>
          <BreadLink title="Sales" isFirst />
          <BreadLink title="Inbounds" link="/sales/inbounds" />
          <BreadLink title={"New"} isLast />
        </Breadcrumbs>
        <InboundForm {...response} />
      </DataPageShell>
    </div>
  );
}
