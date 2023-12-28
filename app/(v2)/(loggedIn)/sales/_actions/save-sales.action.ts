"use server";

import { _saveSales } from "@/app/(v2)/(loggedIn)/sales/_data-access/save-sales.persistence";
import { _updateProdQty } from "@/app/(v2)/(loggedIn)/sales/_data-access/update-prod-qty.dac";

export async function saveSaleAction(id, data, items) {
    const order = await _saveSales(id, data, items);
    await _updateProdQty(order.id);
    return order;
}
