"use server";

import { composeEmailTemplate } from "@/modules/email/emails/composed-email";
import { salesEventData } from ".";
import {
    composeStackLine,
    composeText,
    mailComposer,
} from "@/utils/email-composer";
import { user } from "@/app/(v1)/_actions/utils";

export async function salesUpdatedEvent(id) {
    const data = await salesEventData(id);
    const auth = await user();
    const mc = mailComposer;
    return {
        stack: composeStackLine([
            composeText(`${data.type} updated.`),
            mc.table(
                [],
                [
                    mc.tableRow(
                        mc.text(`${data.type} #`),
                        mc.text(`${data.orderId}`)
                    ),
                    mc.tableRow(
                        mc.text(`Sales Rep:`),
                        mc.text(`${data.salesRep?.name}`)
                    ),
                ]
            ),
        ]),
        preview: `${data.type} updated by ${auth?.name}`,
        subject: `${data.type} updated by ${auth?.name}`,
    };
}
