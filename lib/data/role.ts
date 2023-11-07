import { camel } from "../utils";

export const permissions: any[] = [
    "dashboard",
    //community
    "project",
    "builders",
    "invoice",
    "installation",
    "production",
    "home key",
    "deco shutter install",
    //contractor
    "assign tasks",
    "documents",
    "jobs",
    "job payment",
    //sales
    "orders",
    "sales customers",
    "estimates",
    "delivery",
    "order production",
    "order payment",
    "putaway",
    "inbound order",
    //hrm
    "role",
    "employee",
    "customer service",
    "tech"
    // "assign installer",
    // "cost",
    // "sales invoice",
    // "price list",
    // "email template",
]; //.sort((a, b) => a - b);
export const adminPermissions = permissions.reduce((acc, val, index, arr) => {
    const p = arr[index];
    return { ...acc, [camel(`view ${p}`)]: true, [camel(`edit ${p}`)]: true };
}, {});
