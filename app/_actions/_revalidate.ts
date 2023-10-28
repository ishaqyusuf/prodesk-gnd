"use server";

import { revalidatePath } from "next/cache";

type revalidatePaths = "pickup" | "jobs" | "orders" | "estimates";
export async function _revalidate(pathName: revalidatePaths) {
    const path = {
        pickup: "/sales/pickup",
        orders: "/sales/orders",
        estimates: "/sales/estimates",
        jobs: "/jobs"
    }[pathName];
    await revalidatePath(path, "page");
}
