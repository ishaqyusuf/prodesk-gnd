"use server";

import { _dykeDoorsSvg } from "@/lib/data/dyke-doors-svg";
import { cldUploadFiles } from "@/lib/upload-file";

export async function cloudinaryBootstrap() {
    let res = await Promise.all(
        _dykeDoorsSvg.map(async (a) => {
            let cldImg;
            if (a.url) {
                const resp = await cldUploadFiles(a.url, "dyke");
                console.log(resp);
                cldImg = resp.secure_url.split("dyke/")[1];
            } else return a;
            return {
                ...a,
                cldImg,
            };
        })
    );
    return res;
    const uploads = await cldUploadFiles(
        _dykeDoorsSvg.filter((s) => s.url)?.map((s) => s.url),
        "dyke"
    );
    return uploads;
}
