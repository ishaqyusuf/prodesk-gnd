import { createPdf } from "../pdf/create-pdf";
import { EmailProps } from "./send";

export async function processAttachments(props: EmailProps) {
    let attachments: { pdf?; error? }[] = [];
    if (props.attachmentLink) return attachments;
    if (props.attachments) {
        attachments = (await createPdf({
            list: props.attachments?.map((a) => ({
                url: a.url,
            })),
        })) as any;
        console.log(attachments);
    }
    return attachments;
}
