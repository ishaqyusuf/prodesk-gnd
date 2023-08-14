import {
  SalesFormResponse,
  salesFormAction,
} from "@/app/_actions/sales/sales-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  BreadLink,
  OrderViewCrumb,
  OrdersCrumb,
} from "@/components/breadcrumbs/links";
import SalesForm from "@/components/forms/sales-form";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
  description: "",
};

export default async function OrderFormPage({
  searchParams,
  params: { slug },
}) {
  const resp: SalesFormResponse = await salesFormAction({
    orderId: slug,
    type: "order",
  });
  const orderId = resp?.form?.orderId;
  return (
    <DataPageShell data={resp}>
      <Breadcrumbs>
        <OrdersCrumb isFirst />
        {orderId && <OrderViewCrumb slug={orderId} />}
        <BreadLink title={orderId ? "Edit" : "New"} isLast />
      </Breadcrumbs>
      <SalesForm newTitle="New Order" slug={slug} data={resp}></SalesForm>
    </DataPageShell>
  );
}
