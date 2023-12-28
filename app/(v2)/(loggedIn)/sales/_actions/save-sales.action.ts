"use server";

import { _saveSales } from "@/data-access/sales/save-sales.persistence";
import { _updateProdQty } from "@/data-access/sales/update-prod-qty.dac";

export async function saveSaleAction(id, data, items) {
    const order = await _saveSales(id, data, items);
    await _updateProdQty(order.id);
    return order;
}
