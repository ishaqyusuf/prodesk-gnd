import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "./lib";

export type UploadFolders = "sales-orders" | "contractor-document" | "dyke";
export async function uploadPDFToCloudinary(
    buffer: Buffer,
    public_id: string,
    folder: UploadFolders
) {
    try {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "raw", public_id, format: "pdf", folder },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            uploadStream.end(buffer);
        });
    } catch (error) {}
}
