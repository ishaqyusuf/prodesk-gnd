"use client";

import PageHeader from "@/components/page-header";
import InboundFormTableShell from "@/components/shells/inbound-form-table-shell";
import { IInboundOrder } from "@/types/sales-inbound";

interface Props {
  list: any;
  form: IInboundOrder;
  suppliers: string[];
}
export default function InboundForm({ form, list, suppliers }: Props) {
  return (
    <>
      <PageHeader title="New Inbound" newLink="/sales/order/new/form" />
      <InboundFormTableShell {...list} suppliers={suppliers} />
    </>
  );
}
