"use server";

import { resend } from "@/lib/resend";
import { processAttachments } from "./attachments";
import { transformEmail } from "./transform";

export interface EmailProps {
    subject;
    data;
    body;
    from;
    replyTo;
    to;
    attachments?: {
        url?: string;
        fileName?: string;
        folder?: string;
    }[];
    attachmentLink?: boolean;
}
export async function sendEmail(props: EmailProps) {
    const { subject, body } = transformEmail(props);
    const attachments = await processAttachments(props);
    const errors = attachments?.filter((a) => a.error);
    const hasError = errors?.length;
    console.log(hasError);
    if (hasError)
        return {
            props,
            error: errors?.map((e) => e.error).join("\n"), //"Unable to process attachment",
        };
    const to = toEmail(props.to);
    if (Array.isArray(to)) {
        const batchMail = await resend.batch.send(
            to?.map((t) => ({
                to: t,
                from: props.from,
                html: body,
                subject,
                reply_to: props.replyTo,
                attachments: attachments?.map((a) => ({
                    filename: a.cloudinary?.public_id,
                    content: a.pdf,
                })),
            }))
        );
    }
    const mail = await resend.emails.send({
        from: props.from,
        to,
        html: body,
        subject: subject,
        reply_to: props.replyTo,
        attachments: attachments?.map((a) => ({
            filename: a.cloudinary?.public_id?.split("/")[1],
            content: a.pdfURI,
        })),
    });
    return {
        // message: mail.data.id,
        // mail: mail,
        error: mail.error ? mail.error.message : null,
        success: !mail.error ? `Sent` : null,
        // success: "Attachment created",
        attachments,
    };
}
function toEmail(to) {
    to = "ishaqyusuf024@gmail.com";
    return to;
}
