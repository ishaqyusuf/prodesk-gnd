import { Permission, Roles } from "../../../types/auth";
export interface Rules {
    rule: "is" | "in" | "isNot";
    permissions: Permission[];
    roles: Roles[];
}
export type NavRule = ReturnType<typeof rule>["or"];
function rule() {
    const rules: Rules[] = [];
    function role(values: Rules["roles"], rule: Rules["rule"] = "is") {
        rules.push({ rule, roles: values, permissions: [] });
        return ctx;
    }
    function can(values: Rules["permissions"], rule: Rules["rule"] = "is") {
        rules.push({ rule, permissions: values, roles: [] });
        return ctx;
    }
    const ctx = {
        rules,
        can,
        role,
        or() {
            return {
                type: "or",
                rules,
            };
        },
        and() {
            return {
                type: "and",
                rules,
            };
        },
    };
    return ctx;
}
const salesPermission = rule().role(["Admin"]).can(["viewSales"]).or();
function createRoute(path, name, icon, rules) {
    return { path, name, icon, rules };
}
export const routes = {
    "sales.dashboard": createRoute(
        "/sales-dashboard",
        "Sales Dashboard",
        "sales",
        salesPermission
    ),
    "sales.orders": createRoute(
        "/sales-books/orders",
        "Orders",
        "orders",
        salesPermission
    ),
    "sales.quotes": createRoute(
        "/sales-books/quotes",
        "Quotes",
        "estimates",
        salesPermission
    ),
    "sales.customers": createRoute(
        "/sales-books/customers",
        "Quotes",
        "estimates",
        salesPermission
    ),
    "sales.dealers": createRoute(
        "/sales-books/dealers",
        "Dealers",
        "dealers",
        salesPermission
    ),
    "sales.dispatch": createRoute(
        "/sales-books/dispatch",
        "Dispatch",
        "delivery",
        salesPermission
    ),
    "sales.productions": createRoute(
        "/sales-books/productions",
        "Productions",
        "production",
        salesPermission
    ),
    "sales.productions-tasks": createRoute(
        "/sales-books/production-tasks",
        "Productions",
        "production",
        rule().can(["viewProduction"]).role(["Production"]).and()
    ),
    "sales.setttings": createRoute(
        "/sales-books/settings",
        "Settings",
        "settings",
        salesPermission
    ),
    "sales.emails": createRoute(
        "/sales-books/emails",
        "Emails",
        "email",
        salesPermission
    ),
    "sales.commissions": createRoute(
        "/sales/commissions",
        "Commissions",
        "commissions",
        salesPermission
    ),
    "community.projects": createRoute(
        "/community/projects",
        "Projects",
        "projects",
        rule().can(["viewProject"]).and()
    ),
    "community.units": createRoute(
        "/community/units",
        "Units",
        "units",
        rule().can(["viewCommunity"]).and()
    ),
    jobs: createRoute(
        "/community/jobs",
        "Jobs",
        "jobs",
        rule().can(["viewJobs"]).and()
    ),
    "jobs.assign": createRoute(
        "/community/assign-jobs",
        "Assign Jobs",
        "jobs",
        rule().can(["viewProject", "viewInvoice"]).and()
    ),
    "community.contractors": createRoute(
        "/community/contractors",
        "Contractors",
        "warn",
        rule().can(["viewProject", "viewInvoice"]).and()
    ),
    "community.productions": createRoute(
        "/community/productions",
        "Productions",
        "production",
        rule().can(["viewProduction"]).role(["Production"], "isNot").and()
    ),

    "community.invoices": createRoute(
        "/community/invoices",
        "Invoices",
        "invoice",
        rule().can(["viewProject", "viewInvoice"]).and()
    ),
    "community.production-tasks": createRoute(
        "/tasks/unit-productions",
        "Unit Production",
        "production",
        rule().role(["Production"]).and()
    ),
    "hrm.employees": createRoute(
        "/hrm/employees",
        "Employees",
        "hrm",
        rule().can(["viewEmployee"]).and()
    ),
    "hrm.profiles": createRoute(
        "/hrm/profiles",
        "Profiles",
        "menu",
        rule().can([]).and()
    ),
    "hrm.roles": createRoute(
        "/hrm/roles",
        "Roles",
        "roles",
        rule().can(["viewHrm", "viewEmployee"]).or()
    ),
    "jobs.installations": createRoute(
        "/tasks/installations",
        "Installations",
        "installations",
        rule().can(["viewInstallation"]).role(["Admin"], "isNot").and()
    ),
    "job.contractor-payment": createRoute(
        "/payments",
        "Contractor Payment",
        "payment",
        rule().can(["viewInstallation"]).role(["Admin"], "isNot").and()
    ),
    "job.pending-payments": createRoute(
        "/payments/pending",
        "Pending Payments",
        "payment",
        rule().can(["viewProject", "viewInvoice"]).role(["Admin"]).and()
    ),
    "job.punchout": createRoute(
        "/jobs/punchouts",
        "Punchout",
        "punchout",
        rule().can(["viewTech"]).role(["Admin"], "isNot").and()
    ),
    "job.deco-shutter-install": createRoute(
        "/jobs/installations",
        "Installations",
        "installations",
        rule().can(["viewDecoShutterInstall"]).role(["Admin"], "isNot").and()
    ),
    "community.customer-service": createRoute(
        "/customer-services",
        "Customer Service",
        "customerService",
        rule().can(["viewCustomerService"]).and()
    ),
    "contractors.jobs": createRoute(
        "/contractor/jobs",
        "Jobs",
        "jobs",
        rule().can(["viewJobs"]).and()
    ),
    "contractor.assign-tasks": createRoute(
        "/contractor/assign-tasks",
        "Assign Tasks",
        "jobs",
        rule().can(["viewAssignTasks"]).and()
    ),
    contractors: createRoute(
        "/contractor/contractors",
        "Contractors",
        "warn",
        rule().can(["viewDocuments"]).and()
    ),
};
