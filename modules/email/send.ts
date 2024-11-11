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
    }[];
    attachmentLink?: boolean;
}
export async function sendEmail(props: EmailProps) {
    const { subject, body } = transformEmail(props);
    console.log(">>>>>");
    const attachments = await processAttachments(props);
    const errors = attachments?.filter((a) => a.error);
    const hasError = errors?.length;
    console.log(hasError);
    if (hasError)
        return {
            props,
            error: errors?.map((e) => e.error).join("\n"), //"Unable to process attachment",
        };
    const mail = await resend.emails.send({
        from: props.from,
        to: toEmail(props.to),
        html: body,
        subject: subject,
        reply_to: props.replyTo,
        attachments: attachments?.map((a) => ({
            filename: a.cloudinary?.public_id,
            content: a.pdf,
        })),
    });
    return {
        // message: mail.data.id,
        error: mail.error ? mail.error.message : null,
        success: !mail.error ? `Sent` : null,
        // success: "Attachment created",
        attachments,
    };
    console.log("ATTACHMENT PROCESSED");
}
function toEmail(to) {
    to = "ishaqyusuf024@gmail.com";
    return to;
}
