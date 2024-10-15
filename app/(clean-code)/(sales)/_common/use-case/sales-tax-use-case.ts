"use server";

import { getTaxesDta } from "../data-access/tax.dta";

export async function getTaxListOptionUseCase() {
    const res = await getTaxesDta();
    return [{ title: "None", taxCode: null }, ...res];
}
