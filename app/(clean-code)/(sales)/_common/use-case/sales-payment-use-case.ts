"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    getPaymentTerminalsDta,
    getSalesPaymentDta,
} from "../data-access/sales-payment-dta";

export type GetSalesPayment = AsyncFnType<typeof getSalesPaymentUseCase>;
export async function getSalesPaymentUseCase(id) {
    const resp = await getSalesPaymentDta(id);
    return resp;
}
export type GetPaymentTerminals = AsyncFnType<
    typeof getPaymentTerminalsUseCase
>;
export async function getPaymentTerminalsUseCase() {
    const resp = await getPaymentTerminalsDta();
    return resp;
}
