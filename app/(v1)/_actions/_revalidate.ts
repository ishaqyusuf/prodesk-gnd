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
    communityTemplate: "/settings/community/community-template/[slug]",
    customers: "/sales/customers",
    "contractor-overview": "/contractors/overview/[contractorId]",
    delivery: "/sales/delivery",
    quotes: "/sales/quotes",
    homes: "/community/units",
    jobs: "/contractor/jobs",
    orders: "/sales/orders",
    backorders: "/sales/back-orders",
    pickup: "/sales/pickup",
    projects: "/community/projects",
    "overview-order": "/sales/order/[slug]",
    "invoice-order": "/sales/order/[slug]/form",
    "overview-estimate": "/sales/quote/[slug]",
    "my-jobs": "tasks/installations",
    "invoice-estimate": "/sales/quote/[slug]/form",
    salesV2Form: "/sales-v2/form/[...slug]",
    "sales-production-2": "/sales-v2/productions",
    salesOverview: "/sales-v2/overview/[...typeAndSlug]",
    payables: "/sales/accounting/payables",
    employees: "/hrm/employees",
    customerProfiles: "/sales/customers/profiles",
    roles: "/hrm/roles",
};
export type RevalidatePaths = keyof typeof _path;
export async function _revalidate(pathName: RevalidatePaths) {
    const path = _path[pathName];
    await revalidatePath(path, "page");
}
