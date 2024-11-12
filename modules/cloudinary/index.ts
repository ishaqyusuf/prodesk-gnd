import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "./lib";

export type UploadFolders = "sales-orders" | "contractor-document" | "dyke";
export async function uploadPDFToCloudinary(
    buffer: Buffer,
    public_id: string,
    folder: UploadFolders
) {
    try {
        return new Promise<UploadApiResponse & { downloadUrl?: string }>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "raw",
                        public_id,
                        format: "pdf",
                        folder,
                        overwrite: true,
                    },
                    (error, result) => {
                        if (result) {
                            resolve({
                                ...result,
                                downloadUrl: `${result.secure_url
                                    ?.split("raw")[0]
                                    ?.replace(
                                        "res.",
                                        "res-console."
                                    )}media_explorer_thumbnails/${
                                    result.asset_id
                                }/download`,
                            });
                        } else {
                            reject(error);
                        }
                    }
                );
                uploadStream.end(buffer);
            }
        );
    } catch (error) {}
}
