"use client";

import InboundModal from "@/components/modals/inbound-modal";
import PageHeader from "@/components/page-header";
import InboundFormTableShell from "@/components/shells/inbound-form-table-shell";
import { IInboundOrder } from "@/types/sales-inbound";

interface Props {
  list: any;
  form: IInboundOrder;
  suppliers: string[];
}
export default function InboundForm({ form, list, suppliers }: Props) {
  async function create() {}
  return (
    <>
      <PageHeader title="New Inbound" />
      <InboundFormTableShell {...list} suppliers={suppliers} />
      <InboundModal />
    </>
  );
}
