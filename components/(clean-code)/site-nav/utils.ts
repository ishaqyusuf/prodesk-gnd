import { Icon, IconKeys, Icons } from "@/components/_v1/icons";
import { siteNavStore } from "./store";
import { NavRule, routes } from "./contants";
import { sum } from "@/lib/utils";
import { Home, ShoppingCart, Briefcase, Users } from "lucide-react";

interface GroupMenu {
    title: string;
    links: NavLink[];
    visibleLinks?: number;
}
interface NavLink {
    path: string;
    label: string;
    Icon;
    visible?: boolean;
    rule: NavRule;
    paths: string[];
}
export type ModuleNames = "community" | "sales" | "jobs" | "hrm";
export type ModuleObject = {
    title;
    Icon;
};
export const navModules: { [name in ModuleNames]: ModuleObject } = {
    community: { title: "Community", Icon: Home },
    sales: { title: "Sales", Icon: ShoppingCart },
    jobs: { title: "Jobs", Icon: Briefcase },
    hrm: { title: "HRM", Icon: Users },
};
export type NavModule = (typeof navModules)[];

export const composeSiteNav = (session) => {
    const userRole = session?.role?.name;
    const can = session?.can || {};
    function page(routeKey: keyof typeof routes) {
        const route = routes[routeKey];
        const rules = route?.rule?.rules || [];

        const type = route?.rule?.type;
        const checkRule = (rule) => {
            console.log(rule);

            let _valid = false;
            const isNot = rule.rule == "isNot";
            if (rule.permissions.length > 0) {
                rule.permissions.every((p) => {
                    console.log(can[p], p);
                });
                _valid = isNot
                    ? !rule.permissions.every((p) => !!can[p])
                    : rule.permissions.every((p) => !!can[p]);
            }
            if (rule.roles.length > 0) {
                _valid = isNot
                    ? !rule.roles.includes(userRole)
                    : rule.roles.includes(userRole);
            }

            return _valid;
        };
        const visible =
            type == "or" ? rules?.some(checkRule) : rules?.every(checkRule);

        return {
            ...route,
            visible,
        };
    }
    const store = siteNavStore.getState();
    const sales = composeModule("sales");
    sales.group().menu(page("sales.dashboard")).add();
    sales
        .group("Sales")
        .menu(page("sales.orders"))
        .menu(page("sales.quotes"))
        .menu(page("sales.customers"))
        .menu(page("sales.dealers"))
        .menu(page("sales.dispatch"))
        .menu(page("sales.productions"))
        .menu(page("sales.productions-tasks"))
        .add();
    const community = composeModule("community");
    const hrm = composeModule("hrm");
    // const hrm = community
    hrm.group("HRM")
        .menu(page("hrm.employees"))
        .menu(page("hrm.profiles"))
        .menu(page("hrm.roles"))
        .add()
        .get();
    community
        .group("Community")
        .menu(page("community.projects"))
        .menu(page("community.units"))
        .menu(page("community.productions"))
        .menu(page("community.invoices"))
        .menu(page("community.production-tasks"))
        .add();
    const job = composeModule("jobs");
    job.group("Jobs")
        .menu(page("jobs"))
        .menu(page("job.pending-payments"))
        .menu(page("jobs.installations"))
        .menu(page("job.contractor-payment"))
        .menu(page("job.punchout"))
        .add();
    // const employees = composeModule("")
    // sales.addGroup(hrm);
    const modules = [community.data, sales.data, job.data, hrm.data].map(
        (_mod) => {
            _mod.linkCount = _mod.groupMenu.reduce(
                (acc, g) => acc + g.links.length,
                0
            );
            const links = _mod.groupMenu.map((g) => g.links).flat();
            _mod.mainRoute = links.filter((l) => l.visible)[0]?.path;
            console.log(_mod.mainRoute, links);

            // module.linkCount = 0;
            // module.groupMenu = module.groupMenu.map((gm) => {
            //     gm.visibleLinks = 0;
            //     gm.links.map((link) => {
            //         if (link.visible) {
            //             module.linkCount += 1;
            //             gm.visibleLinks += 1;
            //         }
            //     });
            //     return gm;
            // });
            return _mod;
        }
    );
    const totalLinks = sum(modules, "linkCount");

    store.update("modules", modules);
    store.update("showSideNav", totalLinks > 5);

    // return modules;
};
export type SiteNavModule = {
    moduleName: string;
    groupMenu: GroupMenu[];
    linkCount?;
    mainRoute;
} & ModuleObject; //& (typeof navModules)["community"]; //ReturnType<typeof composeModule>["data"];
function composeModule(node: keyof typeof navModules) {
    const data: SiteNavModule = {
        // title: modules[node],
        ...navModules[node],
        moduleName: node,
        groupMenu: [] as GroupMenu[],
        linkCount: 0,
        mainRoute: null,
    };
    function group(title?) {
        let group: GroupMenu = {
            title,
            links: [],
        };
        function menu(md) {
            group.links.push(md);
            return ctx;
        }
        const ctx = {
            data: group,
            menu,
            add() {
                data.groupMenu.push(group);
                return ctx;
            },
            get() {
                return group;
            },
        };
        return ctx;
    }

    const ret = {
        data,
        group,
        addGroup(group) {
            data.groupMenu.push(group);
            return ret;
        },
    };
    return ret;
}
export function setCurrentModule(path: string) {
    const store = siteNavStore.getState();
    const modules = store.modules;
    const _module = modules.find((m) =>
        m.groupMenu.some((g) =>
            g.links.some((l) => l.paths?.some((p) => p == path))
        )
    );
    const name = _module?.moduleName;
    store.update("activeModule", name);
}
