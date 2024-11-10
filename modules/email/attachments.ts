import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { createPdf } from "../pdf/create-pdf";
import { EmailProps } from "./send";

export async function processAttachments(props: EmailProps) {
    let attachments: {
        pdf?;
        error?;
        cloudinary?: UploadApiResponse;
        cloudinaryError?: UploadApiErrorResponse;
    }[] = [];
    if (props.attachmentLink) return attachments;
    if (props.attachments) {
        attachments = (await createPdf({
            list: props.attachments?.map((a) => ({
                url: a.url,
                fileName: a.fileName,
            })),
        })) as any;
    }
    return attachments;
}
