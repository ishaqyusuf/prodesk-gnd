"use server";

import { revalidatePath } from "next/cache";

type revalidatePaths = "pickup" | "jobs";
export async function _revalidate(pathName: revalidatePaths) {
    const path = {
        pickup: "/sales/pickup",
        jobs: "/jobs"
    }[pathName];
    await revalidatePath(path, "page");
}
