import { createPdf } from "../pdf/create-pdf";
import { EmailProps } from "./send";

export async function processAttachments(props: EmailProps) {
    let attachments: { pdf?; error? }[] = [];
    if (props.attachments) {
        try {
            attachments = (await createPdf({
                list: props.attachments?.map((a) => ({
                    url: a.url,
                })),
            })) as any;
        } catch (error) {
            return {
                error: error.message,
            };
        }
    }
    return null;
}
