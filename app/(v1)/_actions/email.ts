"use server";

import { EmailProps } from "@/types/email";
import { _email } from "./_email";
import { prisma } from "@/db";
import { _dbUser, userId } from "./utils";
import { transformEmail } from "@/lib/email-transform";
// import { resend } from "@/lib/resend";
import { _generateSalesPdf } from "../(loggedIn)/sales/_actions/save-pdf";
import { env } from "@/env.mjs";
import { salesPdf } from "@/app/(v2)/printer/_action/sales-pdf";

import { resend } from "@/lib/resend";

export async function sendMessage(data: EmailProps) {
    const trs = transformEmail(data.subject, data.body, data.data);
    const u = await _dbUser();
    const attachments: any = [];
    const isProd = env.NEXT_PUBLIC_NODE_ENV === "production";
    if (data.attachOrder && isProd) {
        try {
            const pdf = await salesPdf({
                slugs: data.data.slug,
                mode: data.data?.type,
                mockup: "no",
                pdf: true,
                preview: true,
            });

            if (!pdf) throw new Error("pdf not generated.");
            attachments.push({
                content: pdf.uri,
                filename: `${data.data.orderId}.pdf`,
            });
        } catch (error) {
            if (error instanceof Error) console.log(error.message);
            throw Error("Unable to generate pdf");
        }
    }

    const to = data.to?.split(",");

    // console.log(trs);

    const _data = await resend.emails.send({
        reply_to: u?.meta?.emailRespondTo || u?.email,
        from: data.from, //"Pablo From GNDMillwork <pcruz321@gndprodesk.com>",
        // from: "Pablo From GNDMillwork <pablo@gndprodesk.com>",
        to,
        subject: trs.subject,
        html: trs.body,
        attachments,
    });
    // console.log(_data);

    await prisma.inbox.create({
        data: {
            from: data.from,
            type: data.type,
            body: trs.body,
            senderId: (await userId()) as number,
            to: to.join(","),
            sentAt: new Date(),
            subject: trs?.subject,
            parentId: data.parentId,
            createdAt: new Date(),
        },
    });
}
