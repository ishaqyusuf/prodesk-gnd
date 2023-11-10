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
    communityTasks: "/contractor/assign-tasks",
    communityTemplates: "/settings/community/community-templates",
    customers: "/sales/customers",
    delivery: "/sales/delivery",
    estimates: "/sales/estimates",
    homes: "/community/units",
    jobs: "/contractor/jobs",
    orders: "/sales/orders",
    pickup: "/sales/pickup",
    projects: "/community/projects"
};
type revalidatePaths = keyof typeof _path;
export async function _revalidate(pathName: revalidatePaths) {
    const path = _path[pathName];
    await revalidatePath(path, "page");
}
