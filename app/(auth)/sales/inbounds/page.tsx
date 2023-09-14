import { queryParams } from "@/app/_actions/action-utils";
import { getInboundOrders } from "@/app/_actions/sales-inbound/crud";
import { getOrderableItemsCount } from "@/app/_actions/sales-inbound/get-orderable-items";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import PageHeader from "@/components/page-header";
import InboundsTableShell from "@/components/shells/inbounds-table-shell";
import InboundLayout from "@/components/tab-layouts/inbound-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbounds Orders",
};
export default async function InboundPage({ searchParams }) {
  const response = await getInboundOrders(queryParams(searchParams));
  const op = await getOrderableItemsCount();
  return (
    <InboundLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Inbounds" />
        <BreadLink isLast title="Inbound Orders" />
      </Breadcrumbs>
      <PageHeader
        title="Inbound Orders"
        buttonText={`New (${op})`}
        newLink={"/sales/inbound/form/new"}
      />
      <InboundsTableShell {...response} />
    </InboundLayout>
  );
}
