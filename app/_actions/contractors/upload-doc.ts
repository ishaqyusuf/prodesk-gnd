"use server";
import { env } from "@/env.mjs";
// import cloudinary from "@cloudinary/react";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfig = cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
    secure: true
});
export async function _uploadDoc({ buffer }) {
    // console.log(file);
    const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({}, function(error, result) {
                if (error) reject(error);
                else resolve(result);
            })
            .end(buffer);
        resolve(true);
    });
    console.log(upload);
}
export async function getSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: "next" },
        cloudinaryConfig.api_secret
    );

    return { timestamp, signature };
}
export async function saveToDatabase({ public_id, version, signature }) {
    // verify the data
    const expectedSignature = cloudinary.utils.api_sign_request(
        { public_id, version },
        cloudinaryConfig.api_secret
    );

    if (expectedSignature === signature) {
        // safe to write to database
        console.log({ public_id });
    }
}
