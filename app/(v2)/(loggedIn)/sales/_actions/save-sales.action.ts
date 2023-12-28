"use server";

import { _saveSales } from "@/data-access/sales/save-sales.persistence";

export async function saveSaleAction(id, data, items) {
    const order = await _saveSales(id, data, items);
}
