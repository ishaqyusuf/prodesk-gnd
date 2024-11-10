import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "./lib";

export async function uploadPDFToCloudinary(buffer: Buffer, public_id: string) {
    try {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "raw", public_id, format: "pdf" },
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
