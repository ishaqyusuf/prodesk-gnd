"use server";

import { revalidatePath } from "next/cache";

type revalidatePaths =
    | "pickup"
    | "jobs"
    | "orders"
    | "estimates"
    | "communityTemplates";
export async function _revalidate(pathName: revalidatePaths) {
    const path = {
        pickup: "/sales/pickup",
        orders: "/sales/orders",
        estimates: "/sales/estimates",
        jobs: "/jobs",
        communityTemplates: "/settings/community/community-templates"
    }[pathName];
    await revalidatePath(path, "page");
}
