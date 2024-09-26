import { IconKeys, Icons } from "@/components/_v1/icons";
import { LayoutGrid, LucideIcon } from "lucide-react";
import { Session } from "next-auth";

type Submenu = {
    href: string;
    label: string;
    active: boolean;
};

type Menu = {
    href: string;
    label: string;
    active?: boolean;
    visible: boolean;
    icon: LucideIcon;
    submenus: Submenu[];
    module?: (typeof modules)[number]["title"];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};
const modules = [
    { title: "community", path: "community" },
    { title: "sales", path: "sales-book" },
] as const;

export function getMenuList(pathname: string, session: Session): Group[] {
    const menuList: Group[] = [];
    // session.can
    type T = keyof NonNullable<typeof session.can>;
    const isAdmin = session?.role?.name == "Admin";

    function addGroup(groupLabel?: string) {
        let group: Group = { groupLabel, menus: [] };
        const ctx = {
            menu(label, href, icon: IconKeys, permission?, submenus = []) {
                group.menus.push({
                    label,
                    href,
                    visible: permission,
                    submenus,
                    icon: Icons[icon] as any,
                    active: pathname.startsWith(href),
                });
                return ctx;
            },
            commit() {
                menuList.push(group);
                // return ctx;
            },
        };
        return ctx;
    }
    function and(...rules: (T | boolean)[]) {
        return rules.every((r) => r == true);
    }
    function or(...rules: (T | boolean)[]) {
        return rules.some((r) => r == true);
    }

    const canSales = or(isAdmin, and("viewSales"));
    addGroup("")
        .menu("Dashboard", "/sales-book/dashboard", "dashboard", canSales)
        .commit();
    addGroup("Sales")
        .menu("Orders", "/sales-book/orders", "orders", canSales)
        .menu("Quotes", "/sales-book/quotes", "estimates", canSales)
        .menu("Customers", "/sales-book/customers", "user", canSales)
        .menu("Dealers", "/sales-book/dealers", "dealer", canSales)
        .menu("Pickup", "/sales-book/pickups", "pickup", canSales)
        .menu("Delivery", "/sales-book/deliveries", "delivery", canSales)
        .menu("Productions", "/sales-book/productions", "production", canSales)
        .commit();
    const viewHrm = or("viewHrm", "viewEmployee");
    addGroup("HRM")
        .menu("Employees", "/hrm/employees", "hrm", viewHrm)
        .menu("Profiles", "/hrm/profiles", "menu", viewHrm)
        .menu("Roles", "/hrm/roles", "reciept", viewHrm)
        .commit();

    // .menu('Installations','/')
    addGroup("Settings")
        .menu("Sales Settings", "/sales-book/settings", "settings", canSales)
        .menu("Email", "/sales-book/email", "Email", canSales)
        .commit();

    addGroup("Community")
        .menu("Projects", "/community/projects", "project", and("viewProject"))
        .menu("Units", "/community/units", "units", and("viewCommunity"))
        .commit();
    addGroup("Jobs")
        .menu(
            "Jobs",
            "/community/jobs",
            "jobs",
            and("viewProject", "viewInvoice")
        )
        .menu(
            "Assign Jobs",
            "/community/assign-tasks",
            "jobs",
            and("viewProject", "viewInvoice")
        )
        .menu(
            "Contractors",
            "/community/contractors",
            "Warn",
            and("viewProject", "viewInvoice")
        )
        .commit();
    return menuList;
    // return [
    //     {
    //         groupLabel: "",
    //         menus: [
    //             {
    //                 href: "/dashboard",
    //                 label: "Dashboard",
    //                 active: pathname.includes("/dashboard"),
    //                 icon: LayoutGrid,
    //                 submenus: [],
    //             },
    //         ],
    //     },
    // ];
}