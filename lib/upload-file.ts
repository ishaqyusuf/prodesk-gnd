import { getSignature } from "@/app/(v1)/_actions/cloudinary/cloudinary";
import { env } from "@/env.mjs";

export async function uploadFile(file, folder) {
    const { timestamp, signature } = await getSignature(folder);

    const formData = new FormData();
    // if (Array.isArray(file))
    // file.map((f, i) => formData.append(`file${i + 1}`, f));
    // else
    formData.append("file", file);
    formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp as any);
    formData.append("folder", folder);
    const endpoint = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;
    // console.log({ endpoint, timestamp, signature });

    const data = await fetch(endpoint, {
        method: "POST",
        body: formData,
    }).then((res) => res.json());
    return data;
}
