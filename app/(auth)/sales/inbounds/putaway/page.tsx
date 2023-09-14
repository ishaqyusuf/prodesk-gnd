import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import PageHeader from "@/components/page-header";
import InboundLayout from "@/components/tab-layouts/inbound-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbounds",
};
export default async function PutawayPage({}) {
  return (
    <InboundLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Inbounds" />
        <BreadLink isLast title="Inbound Orders" />
      </Breadcrumbs>
      <PageHeader title="Inbound Orders" newLink={"/sales/inbounds/edit/new"} />
    </InboundLayout>
  );
}
