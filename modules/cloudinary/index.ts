import { cloudinary } from "./lib";

export async function uploadPDFToCloudinary(buffer: Buffer, public_id: string) {
    try {
        // const res = await cloudinary.uploader.upload_stream(
        //     {
        //         resource_type: "raw",
        //         public_id,
        //         format: "pdf",
        //     },
        //     (error, result) => {
        //         if (error) {
        //             console.log(error);
        //         }
        //         console.log(result);

        //         return result;
        //     }
        // );
        return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "raw", public_id, format: "pdf" },
                (error, result) => {
                    if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(error);
                    }
                }
            );
            uploadStream.end(buffer);
        });
    } catch (error) {}
}
