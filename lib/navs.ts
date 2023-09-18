import { env } from "@/env.mjs";
import { ICan } from "@/types/auth";

import {
  Banknote,
  Briefcase,
  Building,
  CircleDot,
  ClipboardList,
  Cog,
  Construction,
  Cpu,
  CreditCard,
  FolderGit2,
  Home,
  LayoutDashboard,
  LayoutTemplate,
  NewspaperIcon,
  Package,
  PackageOpen,
  Pin,
  School,
  Settings2,
  ShoppingBag,
  User,
  UsersIcon,
  Workflow,
} from "lucide-react";
import { Session } from "next-auth";

function _route(title, icon, path) {
  return { title, icon, path };
}
type Route = { title; icon; path };
interface ISidebarRoute {
  title?;
  routes: Route[];
}
export interface ISidebar {
  routeGroup: ISidebarRoute[];
  totalRoutes?;
  homeRoute;
  noSideBar: Boolean;
  flatRoutes: Route[];
  CommunitySettings: Route[];
  Hrm: Route[];
  Job: Route[];
}
export function nav(
  session: Session | null,
  isProd = true
): ISidebar | undefined {
  // {user,role,can}
  if (!session?.user) return undefined;
  const prodQuery = ``;
  //`?_dateType=prodDueDate&date=${dayjs().format(
  // "YYYY-MM-DD"
  // )}`;
  const __can = session?.can;
  const role:
    | "Production"
    | "Punchout"
    | "1099 Contractor"
    | "Customer Service" = session?.role?.name as any;
  const {
    viewProject,
    viewProduction,
    viewBuilders,
    viewInvoice,
    viewOrders,
    viewCost,
    editOrders,
    editProject,
    viewInstallation,
    viewTech,
    viewHrm,
    viewEmployee,
    viewPriceList,
    viewCustomerService,
  }: ICan = __can;
  const routes: {
    [key in
      | "Dashboard"
      | "Community"
      | "Sales"
      | "Services"
      | "Hrm"
      | "Job"
      | "Settings"]: Route[];
  } = {
    Dashboard: [],
    Hrm: [],
    Job: [],
    Services: [],
    Community: [],
    Sales: [],
    Settings: [_route("Profile Settings", Settings2, "/settings/profile")],
  };
  const isAdmin = session.role?.name == "Admin";
  if (isAdmin) {
    routes.Dashboard.push(_route("Dashboard", LayoutDashboard, "/dashboard"));
    routes.Settings.push(_route("Sales", Cog, "/settings/sales"));
  }
  if (viewProject) {
    routes.Community.push(
      ...[
        _route("Projects", FolderGit2, "/community/projects"),
        _route("Units", Home, "/community/units"),
      ]
    );
  }
  viewProduction &&
    role != "Production" &&
    routes.Community.push(
      _route("Productions", Construction, "/community/productions")
    );
  viewInvoice &&
    routes.Community.push(
      _route("Invoices", NewspaperIcon, "/community/invoices")
    );

  if (role == "Production") {
    routes.Services.push(
      _route(
        "Sales Production",
        Construction,
        `/tasks/sales-productions`
        // `/tasks/sales-productions${prodQuery}`
      ),
      _route("Unit Production", Construction, "/tasks/unit-productions")
    );
  }
  if (role == "1099 Contractor") {
    routes.Services.push(_route("Installations", Pin, "/tasks/installations"));
    routes.Services.push(_route("Payments", Pin, "/tasks/payments"));
  }
  if (role == "Punchout") {
    routes.Services.push(_route("Punchout", Cpu, "/tasks/punchouts"));
    routes.Services.push(_route("Payments", Pin, "/tasks/payments"));
  }
  if (viewCustomerService)
    routes.Services.push(
      _route("Customer Service", ClipboardList, "/customer-services")
    );
  const Hrm: Route[] = [];

  let _hrm = (() => {
    const _rw: any = {};
    let href: any = null;
    function setHref(title, _href) {
      if (!href) href = _href;
      _rw[_href] = _route(title, LayoutTemplate, `/hrm/${_href}`);
    }
    if (viewHrm || viewEmployee) {
      setHref("Employees", "employees");
      setHref("Profile", "profiles");
      setHref("Roles", "roles");
    }
    Hrm.push(...(Object.values(_rw) as any));
    if (href) return _route("Hrm", Building, `/hrm/${href}`);
    return null;
  })();

  if (_hrm) routes.Hrm.push(_hrm);
  const Job: Route[] = [];
  let _job = (() => {
    const _rw: any = {};
    let href: any = null;
    function setHref(title, _href) {
      if (!href) href = _href;
      _rw[_href] = _route(title, LayoutTemplate, `${_href}`);
    }

    if (viewProject && viewInvoice) setHref("Jobs", "/jobs");
    if (viewProject && viewInvoice)
      setHref("Payment Receipts", "/jobs/payments");
    if (viewProject && viewInvoice)
      setHref("Pending Payments", "/jobs/payments/pay");
    Job.push(...(Object.values(_rw) as any));
    if (href) return _route("Jobs", Briefcase, `${href}`);
  })();
  if (_job) routes.Job.push(_job);
  if (viewOrders) {
    routes.Sales.push(
      ...[
        _route("Estimates", Banknote, "/sales/estimates"), //employees,roles
        _route("Orders", ShoppingBag, "/sales/orders"), //employees,roles
        _route("Customers", User, "/sales/customers"),
      ]
    );
  }
  if (editOrders)
    routes.Sales.push(
      ...[
        // _route("Sales Jobs", Briefcase, "/sales/jobs"),
        _route("Payments", CreditCard, "/sales/payments"),
        _route("Catalogs", PackageOpen, "/sales/catalogs"),
        // _route("Productions", Construction, `/sales/productions${prodQuery}`),
        _route("Productions", Workflow, `/sales/productions`),
        _route("Inbounds", Package, `/sales/inbounds`),
        // _route("Pending Stocks", CircleDot, "/sales/pending-stocks"),
      ]
    );

  const CommunitySettings: Route[] = [];
  let _communitySettings = (() => {
    const _rw: any = {};
    let href: any = null;
    function setHref(title, _href) {
      href = _href;
      _rw[_href] = _route(
        title,
        LayoutTemplate,
        `/settings/community/${_href}`
      );
    }
    if (viewCost || viewPriceList) {
      setHref("Install Costs", "install-costs");
      setHref("Model Costs", "model-costs");
    }
    if (editProject) {
      setHref("Model Templates", "model-templates");
      setHref("Community Templates", "community-templates");
    }
    if (viewBuilders) setHref("Builders", "builders");
    CommunitySettings.push(
      ...[
        _rw.builders,
        _rw["model-costs"],
        _rw["model-templates"],
        _rw["community-templates"],
        _rw["install-costs"],
      ].filter(Boolean)
    );
    if (href)
      return _route("Community", LayoutTemplate, `/settings/community/${href}`);
    return null;
  })();
  if (_communitySettings) routes.Settings.push(_communitySettings);

  let routeGroup: { routes: Route[]; title }[] = [];
  let totalRoutes = 0;
  let flatRoutes: Route[] = [];
  let homeRoute = null;
  Object.entries(routes).map(([title, r]) => {
    let len = r?.length;
    if (len == 0) return;
    totalRoutes += len;
    if (!homeRoute) homeRoute = r?.[0]?.path;
    flatRoutes.push(...r);
    const __routes = r.filter(Boolean) as Route[];
    routeGroup.push({
      title: len < 2 ? null : title,
      routes: __routes,
    });
  });
  routeGroup = routeGroup?.filter(
    (sec) => (sec.routes as any)?.length > 0
  ) as any;
  return {
    flatRoutes,
    routeGroup,
    // totalRoutes < 6 ? [{ routes: flatRoutes, title: "" }] : routeGroup,
    totalRoutes,
    homeRoute: homeRoute || "/login",
    noSideBar: totalRoutes < 6,
    CommunitySettings,
    Hrm,
    Job,
  };
}

const isProd = env.NEXT_PUBLIC_NODE_ENV == "production";
export const upRoutes = [
  "Dashboard",
  !isProd && "Community",
  !isProd && "Hrm",
  !isProd && "Services",
  !isProd && "Settings",
  // !isProd && "Community/Units",
  // !isProd && "Community/C"/,
  "Sales/Estimates",
  "Sales/Orders",
  "Sales/Customers",
  "Sales/Productions",
  "Services/Sales Production",
  "Settings/Sales",
  "Settings/Profile",
];
