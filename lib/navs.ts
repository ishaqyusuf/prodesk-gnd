import { ICan } from "@/types/auth";
import dayjs from "dayjs";
import {
  Banknote,
  Briefcase,
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
  PackageOpen,
  Pin,
  School,
  Settings2,
  ShoppingBag,
  User,
} from "lucide-react";
import { Session } from "next-auth";

function _route(title, icon, path) {
  return { title, icon, path };
}
interface ISidebarRoute {
  title?;
  routes: { title; icon; path }[];
}
export interface ISidebar {
  routeGroup: ISidebarRoute[];
  totalRoutes?;
  homeRoute;
  noSideBar: Boolean;
  flatRoutes: { title; icon; path }[];
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
  const role: "Production" | "Punchout" | "Installation" = session?.role
    ?.name as any;
  const {
    viewProject,
    viewProduction,
    viewBuilders,
    viewInvoice,
    viewOrders,
    viewCost,
    viewInstallation,
    viewTech,
    viewHrm,
    viewEmployee,
    viewPriceList,
    viewCustomerService,
  }: ICan = __can;
  type Route = { title; icon; path };
  const routes: {
    [key in
      | "Dashboard"
      | "Community"
      | "Sales"
      | "Services"
      | "Hrm"
      | "Settings"]: Route[];
  } = {
    Dashboard: [],
    Community: [],
    Sales: [],
    Services: [],
    Hrm: [],
    Settings: [_route("Profile Settings", Settings2, "/settings/profile")],
  };
  const isAdmin =
    Object.values(__can).every(Boolean) || session.role?.name == "Admin";
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
  viewBuilders &&
    routes.Community.push(_route("Builders", School, "/community/builders"));
  (viewCost || viewPriceList) &&
    routes.Community.push(
      _route("Models", LayoutTemplate, "/community/models")
    );
  if (role == "Production") {
    routes.Services.push(
      _route(
        "Sales Production",
        Construction,
        `/tasks/sales-productions${prodQuery}`
      ),
      _route("Unit Production", Construction, "/tasks/unit-productions")
    );
  }
  if (role == "Installation") {
    routes.Services.push(_route("Installations", Pin, "/tasks/installations"));
  }
  if (role == "Punchout") {
    routes.Services.push(_route("Punchout", Cpu, "/tasks/punchouts"));
  }
  if (viewCustomerService)
    routes.Services.push(
      _route("Customer Service", ClipboardList, "work-orders/customer-services")
    );
  if (viewOrders) {
    routes.Sales.push(
      ...[
        _route("Estimates", Banknote, "/sales/estimates"), //employees,roles
        _route("Orders", ShoppingBag, "/sales/orders"), //employees,roles
        _route("Customers", User, "/sales/customers"),
        _route("Sales Jobs", Briefcase, "/sales/jobs"),
        _route("Payments", CreditCard, "/sales/payments"),
        _route("Products", PackageOpen, "/sales/products"),
        _route("Productions", Construction, `/sales/productions${prodQuery}`),
        _route("Pending Stocks", CircleDot, "/sales/pending-stocks"),
      ]
    );
  }
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
    routeGroup.push({
      title: len < 2 ? null : title,
      routes: r
        .map((_r) =>
          upRoutes.includes(`${title}/**`) ||
          upRoutes.includes(`${title}/${_r.title}`) ||
          !isProd
            ? _r
            : null
        )
        .filter(Boolean) as Route[],
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
  };
}

export const upRoutes = [
  "Sales/Estimates",
  "Sales/Orders",
  "Sales/Productions",
  "Services/Sales Production",
  "Settings/Sales",
  "Settings/Profile",
];
