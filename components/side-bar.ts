import { ICan } from "@/types/IAuth";
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
  Mail,
  NewspaperIcon,
  PackageOpen,
  Pin,
  School,
  Settings2,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
function _route(title, icon, path) {
  return { title, icon, path };
}
interface ISidebarRoute {
  title?;
  routes: { title; icon; path }[];
}
export interface INav {
  routeGroup: ISidebarRoute[];
  navCount?;
}
export function useNav(): INav {
  const { data: session } = useSession();
  console.log(session);
  //   return [];
  if (!session?.user)
    return {
      routeGroup: [],
    };
  // console.log(session);
  if (session?.role?.name == "Production") {
    //
  }
  const __can = session?.can;

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
  const isAdmin =
    Object.values(__can).every(Boolean) || session.role?.name == "Admin";
  //   console.log(isAdmin);
  const prodQuery = `?_dateType=prodDueDate&date=${dayjs().format(
    "YYYY-MM-DD"
  )}`;
  let routeGroup: ISidebarRoute[] = [
    {
      routes: [
        isAdmin && _route("Dashboard", LayoutDashboard, "/dashboard"),
      ].filter(Boolean),
    },
    {
      title: "Community",
      routes: [
        (isAdmin || viewProject) &&
          _route("Projects", FolderGit2, "/community/projects"),
        (isAdmin || viewProject) && _route("Units", Home, "/community/units"),
        (isAdmin || viewProduction) &&
          _route("Productions", Construction, "/community/productions"),

        (isAdmin || viewInvoice) &&
          _route("Invoices", NewspaperIcon, "/community/invoices"),
        (isAdmin || viewBuilders) &&
          _route("Builders", School, "/community/builders"),
        (isAdmin || viewCost || viewPriceList) &&
          _route("Models", LayoutTemplate, "/community/models"), //unit,community,price-chart
      ].filter(Boolean),
    },
    {
      routes: [
        !isAdmin &&
          viewProduction &&
          _route("Productions", Construction, `/productions${prodQuery}`),
      ].filter(Boolean),
    },
    {
      routes: [
        !isAdmin &&
          viewInstallation &&
          _route("Installations", Pin, "/installations"),
      ].filter(Boolean),
    },
    {
      routes: [
        !isAdmin && viewTech && _route("Punchout", Cpu, "/punchouts"),
      ].filter(Boolean),
    },
    {
      title: "HRM",
      routes: [
        (viewHrm || viewEmployee) &&
          _route("Employees", Users, "/hrm/employees"), //employees,roles
        (viewHrm || isAdmin) && _route("Jobs", Briefcase, "/hrm/jobs"),
      ].filter(Boolean),
    },
    {
      title: "Sales",
      routes: (viewOrders || isAdmin) && [
        _route("Estimates", Banknote, "/sales/estimates"), //employees,roles
        _route("Orders", ShoppingBag, "/sales/orders"), //employees,roles
        _route("Customers", User, "/sales/customers"),
        _route("Sales Jobs", Briefcase, "/sales/jobs"),
        _route("Payments", CreditCard, "/sales/payments"),
        _route("Products", PackageOpen, "/sales/products"),
        _route("Productions", Construction, `/sales/productions${prodQuery}`),
        _route("Pending Stocks", CircleDot, "/sales/pending-stocks"),
      ],
    },
    {
      routes: [
        viewCustomerService &&
          _route(
            "Customer Service",
            ClipboardList,
            "work-orders/customer-services"
          ),
      ].filter(Boolean),
    },
    {
      title: "Settings",
      routes: [
        _route("Profile Settings", Settings2, "/settings/profile"), //employees,roles
        isAdmin && _route("Customers", Mail, "/settings/email-templates"),
        isAdmin && _route("Sales", Cog, "/settings/sales"),
      ],
    },
  ];
  routeGroup = routeGroup
    .map((rg) => ({
      title: rg.title,
      routes: rg?.routes
        ? rg?.routes
            ?.map(
              (r) =>
                (upRoutes.includes(`${rg.title}/**`) ||
                  upRoutes.includes(`${rg.title}/${r.title}`)) &&
                r
            )
            .filter(Boolean)
        : [],
    }))
    .filter((sec) => sec?.title && (sec.routes as any)?.length > 0) as any;

  let navCount = 0;
  routeGroup.map((r) => (navCount += r.routes?.length));
  return {
    navCount,
    routeGroup,
  };
}
export const upRoutes = ["Sales/**", "Settings/Sales"];
