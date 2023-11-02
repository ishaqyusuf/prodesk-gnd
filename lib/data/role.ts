import { camel } from "../utils";

export const permissions: any[] = [
    "project",
    "dashboard",
    "invoice",
    "role",
    "employee",
    "production",
    "delivery",
    "customer service",
    "tech",
    "installation",
    // "assign installer",
    "builders",
    "cost",
    "sales customers",
    "orders",
    // "sales invoice",
    "estimates",
    "order production",
    "order payment",
    "price list",
    "email template",
    "home key",
    "inbound order",
    "putaway",
    "deco shutter install"
]; //.sort((a, b) => a - b);
export const adminPermissions = permissions.reduce((acc, val, index, arr) => {
    const p = arr[index];
    return { ...acc, [camel(`view ${p}`)]: true, [camel(`edit ${p}`)]: true };
}, {});
