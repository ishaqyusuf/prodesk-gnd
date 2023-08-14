import {
  SalesFormResponse,
  salesFormAction,
} from "@/app/_actions/sales/sales-form";
import SalesForm from "@/components/forms/sales-form";
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
    type: "estimate",
  });
  console.log(resp);
  return (
    <SalesForm newTitle="New Estimate" slug={slug} data={resp}></SalesForm>
  );
}
