"use server";

import { revalidatePath } from "next/cache";

// type revalidatePaths =
//     | "pickup"
//     | "jobs"
//     | "orders"
//     | "estimates"
//     | "communityTasks"
//     | "communityTemplates";
const _path = {
    pickup: "/sales/pickup",
    orders: "/sales/orders",
    estimates: "/sales/estimates",
    jobs: "/contractor/jobs",
    communityTasks: "/contractor/assign-tasks",
    communityTemplates: "/settings/community/community-templates",
    homes: "/community/units"
};
type revalidatePaths = keyof typeof _path;
export async function _revalidate(pathName: revalidatePaths) {
    const path = _path[pathName];
    await revalidatePath(path, "page");
}
