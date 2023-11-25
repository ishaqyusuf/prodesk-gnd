import { getSignature } from "@/app/_actions/contractors/upload-doc";
import { env } from "@/env.mjs";

export async function uploadFile(file, folder) {
    console.log(">>");
    const { timestamp, signature } = await getSignature();
    console.log(">>");
    const formData = new FormData();
    console.log(">>");
    formData.append("file", file);
    formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp as any);
    formData.append("folder", folder);
    const endpoint = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;
    console.log({ endpoint, timestamp, signature });
    const data = await fetch(endpoint, {
        method: "POST",
        body: formData
    }).then(res => res.json());
    console.log(">>S");
    return data;
}
