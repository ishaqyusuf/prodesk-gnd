"use server";

import { deleteSalesDta } from "../data-access/sales-dta";

export async function deleteSalesUseCase(id) {
    await deleteSalesDta(id);
}
