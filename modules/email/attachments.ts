import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { createPdf } from "../pdf/create-pdf";
import { EmailProps } from "./send";

export async function processAttachments(props: EmailProps) {
    let attachments: {
        pdf?;
        pdfURI?;
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
                folder: a.folder,
            })),
        })) as any;
    }
    return attachments;
}
