"use server";

import { revalidatePath } from "next/cache";

type revalidatePaths = "pickup";
export async function _revalidate(pathName: revalidatePaths) {
    const path = {
        pickup: "/sales/pickup"
    }[pathName];
    await revalidatePath(path, "page");
}
