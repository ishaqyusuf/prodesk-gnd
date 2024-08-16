"use server";

import { EmailProps } from "@/types/email";
import { _email } from "./_email";
import { prisma } from "@/db";
import { _dbUser, userId } from "./utils";
import { transformEmail } from "@/lib/email-transform";
import { _generateSalesPdf } from "../(loggedIn)/sales/_actions/save-pdf";
import { env } from "@/env.mjs";
import { resend } from "@/lib/resend";
import dayjs from "dayjs";
import { __isProd, isProdClient, isProduction } from "@/lib/is-prod";

export interface DownloadProps {
    slug: string;
    date;
    path: string;
}
export async function sendMessage(data: EmailProps, download?: DownloadProps) {
    const trs = transformEmail(data.subject, data.body, data.data);
    // const u = await _dbUser();
    const isProd = __isProd;
    console.log({ isProd, ...data });
    if (data.attachOrder && isProd && download) {
        const token = dayjs(download.date)
            .format("HH:mm:ss")
            ?.split(":")
            .join("");
        trs.body = `${trs.body} </br>
        <a href="gnd-prodesk.vercel.app/download/${download.path}/ptok-${token}/${download.slug}" >Download</a>
        `;
        // try {
        //     const pdf = await salesPdf({
        //         slugs: data.data.slug,
        //         mode: data.data?.type,
        //         mockup: "no",
        //         pdf: true,
        //         preview: true,
        //     });
        //     if (!pdf) throw new Error("pdf not generated.");
        //     attachments.push({
        //         content: pdf.uri,
        //         filename: `${data.data.orderId}.pdf`,
        //     });
        // } catch (error) {
        //     if (error instanceof Error) console.log(error.message);
        //     throw Error("Unable to generate pdf");
        // }
    }

    const to = !isProd ? [`ishaqyusuf024@gmail.com`] : data.to?.split(",");

    // console.log(trs);

    const _data = await resend.emails.send({
        // reply_to: u?.meta?.emailRespondTo || u?.email,
        from: data.from, //"Pablo From GNDMillwork <pcruz321@gndprodesk.com>",
        // from: "Pablo From GNDMillwork <pablo@gndprodesk.com>",
        to,
        subject: trs.subject,
        html: trs.body,
        // attachments,
    });
    // console.log(_data);
    return;
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
