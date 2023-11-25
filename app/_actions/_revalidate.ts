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
    "contractor-overview": "/contractor/overview/[contractorId]",
    delivery: "/sales/delivery",
    estimates: "/sales/estimates",
    homes: "/community/units",
    jobs: "/contractor/jobs",
    orders: "/sales/orders",
    pickup: "/sales/pickup",
    projects: "/community/projects",
    "overview-order": "/sales/order/[slug]",
    "invoice-order": "/sales/order/[slug]/form",
    "overview-estimate": "/sales/estimate/[slug]",
    "invoice-estimate": "/sales/estimate/[slug]/form"
};
export type revalidatePaths = keyof typeof _path;
export async function _revalidate(pathName: revalidatePaths) {
    const path = _path[pathName];
    await revalidatePath(path, "page");
}
