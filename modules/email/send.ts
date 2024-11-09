"use server";

import { processAttachments } from "./attachments";
import { transformEmail } from "./transform";

export interface EmailProps {
    subject;
    data;
    body;
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
            error: errors?.map((e) => e.error).join("\n"), //"Unable to process attachment",
        };

    console.log("ATTACHMENT PROCESSED");
}
