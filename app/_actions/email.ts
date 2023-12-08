"use server";

import { EmailProps } from "@/types/email";
import { _email } from "./_email";
import MailComposer from "@/components/emails/mail-composer";
import { prisma } from "@/db";
import dayjs from "dayjs";
import { userId } from "./utils";
import { transformEmail } from "@/lib/email-transform";
import va from "@/lib/va";
import { resend } from "@/lib/resend";
import { _generateSalesPdf } from "./sales/save-pdf";

export async function sendMessage(data: EmailProps) {
    const trs = transformEmail(data.subject, data.body, data.data);
    // const pdf = await _generateSalesPdf("invoice", [data.data.id]);

    const _data = await resend.emails.send({
        from: "Pablo From GNDMillwork <pcruz321@gndprodesk.com>",
        // from: "Pablo From GNDMillwork <pablo@gndprodesk.com>",
        to: ["pcruz321@gmail.com", "ishaqyusuf024@gmail.com"],
        subject: trs.subject,
        html: trs.body?.split("\n").join("<br/>"),
        attachments: [
            // {
            //     // content: pdf,
            //     path: "https://res.cloudinary.com/dsuwvkg3d/image/upload/v1699009376/cld-sample-5.jpg",
            //     // filename: `${data.data.orderId}.pdf`,
            // },
        ],
        //  react: MailComposer({ firstName: "John" }),
    });
    return;
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
            body: data.body,
            senderId: (await userId()) as number,
            to: data.to,
            subject: data?.subject,
            parentId: data.parentId,
            createdAt: new Date(),
        },
    });
    va.track("new email", {
        type: data.type,
    });
}
