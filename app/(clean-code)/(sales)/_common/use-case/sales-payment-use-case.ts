"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    checkTerminalPaymentStatusDta,
    createSalesPaymentDta,
    CreateSalesPaymentProps,
    getPaymentTerminalsDta,
    getSalesPaymentDta,
} from "../data-access/sales-payment-dta";
import {
    createTerminalCheckout,
    CreateTerminalCheckoutProps,
} from "@/modules/square";

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
interface CreatePayment {
    salesPayment: CreateSalesPaymentProps;
    terminal?: CreateTerminalCheckoutProps;
}
export async function createTerminalPaymentUseCase(data: CreatePayment) {
    const salesPayment = await createSalesPaymentDta(data.salesPayment);

    data.terminal.idempotencyKey = salesPayment.id;
    const terminalCheckout = await createTerminalCheckout(data.terminal);
    return terminalCheckout;
}
export async function checkTerminalPaymentStatusUseCase(id) {
    const s = await checkTerminalPaymentStatusDta(id);
    return s;
}
