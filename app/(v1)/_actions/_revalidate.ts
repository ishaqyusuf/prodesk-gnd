"use server";

import { revalidatePath } from "next/cache";

// type RevalidatePaths =
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
    "contractor-overview": "/contractors/overview/[contractorId]",
    delivery: "/sales/delivery",
    estimates: "/sales/estimates",
    homes: "/community/units",
    jobs: "/contractor/jobs",
    orders: "/sales/orders",
    backorders: "/sales/back-orders",
    pickup: "/sales/pickup",
    projects: "/community/projects",
    "overview-order": "/sales/order/[slug]",
    "invoice-order": "/sales/order/[slug]/form",
    "overview-estimate": "/sales/estimate/[slug]",
    "my-jobs": "tasks/installations",
    "invoice-estimate": "/sales/estimate/[slug]/form",
    sales2: "/sales-v2/form/[...slug]",
    payables: "/sales/accounting/payables",
};
export type RevalidatePaths = keyof typeof _path;
export async function _revalidate(pathName: RevalidatePaths) {
    const path = _path[pathName];
    await revalidatePath(path, "page");
}
