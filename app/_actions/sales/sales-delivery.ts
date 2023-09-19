"use server";

import { SalesQueryParams } from "@/types/sales";
import { getSales } from "./sales";

export async function getSalesDelivery(query: SalesQueryParams) {
  query.deliveryOption = "delivery";
  return await getSales(query);
}
