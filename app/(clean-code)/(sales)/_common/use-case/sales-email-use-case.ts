"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    EmailData,
    getSalesEmailDta,
    inboxDta,
    userEmailProfileDta,
} from "../data-access/sales-mail";

export type GetSalesEmail = AsyncFnType<typeof getSalesEmailUseCase>;
export type MailData = EmailData;
export async function getSalesEmailUseCase(id, type: EmailData["type"]) {
    const data = await getSalesEmailDta(id);
    const inbox = await inboxDta(type, id);
    const sendProfile = await userEmailProfileDta(type);
    return {
        data,
        inbox,
        sendProfile,
        id,
        type,
    };
}
