"use server";

import { EmailProps } from "@/types/email";
import { _email } from "./_email";
import MailComposer from "@/components/emails/mail-composer";
import { prisma } from "@/db";
import dayjs from "dayjs";
import { _dbUser, user, userId } from "./utils";
import { transformEmail } from "@/lib/email-transform";
import va from "@/lib/va";
import { resend } from "@/lib/resend";
import { _generateSalesPdf } from "./sales/save-pdf";

export async function sendMessage(data: EmailProps) {
    const trs = transformEmail(data.subject, data.body, data.data);
    const u = await _dbUser();
    const attachments: any = [];
    if (data.attachOrder) {
        const pdf = await _generateSalesPdf("invoice", [data.data.id]);
        attachments.push({
            content: pdf,
            filename: `${data.data.orderId}.pdf`,
        });
    }
    const _data = await resend.emails.send({
        reply_to: u?.meta?.emailRespondTo || u?.email,
        from: data.from, //"Pablo From GNDMillwork <pcruz321@gndprodesk.com>",
        // from: "Pablo From GNDMillwork <pablo@gndprodesk.com>",
        to: data.to?.split(","),
        // to:["pcruz321@gmail.com", "ishaqyusuf024@gmail.com"],
        subject: trs.subject,
        html: trs.body?.split("\n").join("<br/>"),

        attachments,
        //  react: MailComposer({ firstName: "John" }),
    });
    // return;
    //   await _email({
    //     from: data.from,
    //     user: { email: data.to as any },
    //     subject: trs.subject,
    //     react: MailComposer({
    //       body: trs.body,
    //     }),
    //   });
    await prisma.inbox.create({
        data: {
            from: data.from,
            type: data.type,
            body: trs.body,
            senderId: (await userId()) as number,
            to: data.to,
            sentAt: new Date(),
            subject: trs?.subject,
            parentId: data.parentId,
            createdAt: new Date(),
        },
    });
    // va.track("new email", {
    //     type: data.type,
    // });
}
