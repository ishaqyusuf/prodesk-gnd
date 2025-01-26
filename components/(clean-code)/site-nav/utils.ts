import { IconKeys } from "@/components/_v1/icons";
import { siteNavStore } from "./store";
import { routes } from "./contants";

interface GroupMenu {
    title: string;
    links: NavLink[];
}
interface NavLink {
    path: string;
    label: string;
    icon: IconKeys;
    visible?: boolean;
}
export const modules = {
    community: "Community",
    sales: "Sales",
    jobs: "Jobs",
};
export const composeSiteNav = (session) => {
    const userRole = session?.role?.name;
    const can = session?.can || {};
    function page(routeKey: keyof typeof routes) {
        const route = routes[routeKey];
        const rules = route?.rules?.rules;
        let fn = Array.isArray(rules)
            ? route?.rules?.type == "or"
                ? rules?.some
                : rules?.every
            : null;

        const visible =
            rules &&
            (fn
                ? fn?.((rule) => {
                      let _valid = false;
                      const isNot = rule.rule == "isNot";
                      if (rule.roles) {
                          _valid = isNot
                              ? !rule.roles.includes(userRole)
                              : rule.roles.includes(userRole);
                      } else {
                          _valid = isNot
                              ? !rule.permissions.every((p) => can[p])
                              : rule.permissions.every((p) => can[p]);
                      }
                      return _valid;
                  })
                : false);
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
    const hrm = community
        .group("HRM")
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
    sales.addGroup(hrm);
    const modules = [community.data, sales.data, job.data].map((m) => {
        m.linkCount = m.groupMenu.reduce((acc, g) => acc + g.links.length, 0);
        m.mainRoute = m.groupMenu
            .map((g) => g.links)
            .flat()
            .filter((l) => l.visible)[0]?.path;
        return m;
    });
    console.log({ modules });
};
function composeModule(node: keyof typeof modules) {
    const data = {
        title: modules[node],
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
