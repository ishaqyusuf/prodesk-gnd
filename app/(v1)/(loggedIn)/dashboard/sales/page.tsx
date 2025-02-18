import { salesDashboardAction } from "@/app/(v1)/(loggedIn)/dashboard/sales/_actions/sales-dashboard";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import BarChartComponent from "@/components/_v1/charts/bar-chart";
import Portal from "@/components/_v1/portal";
import RecentSalesDashboardCard from "@/components/_v1/sales/recent-sales-dashboard-card";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { StartCard, StatCardContainer } from "@/components/_v1/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import BarChart from "./_components/bar-chart";

export const metadata: Metadata = {
    title: "Sales Dashboard",
};

interface Props {}
export default async function SalesDashboardPage({}: Props) {
    return <></>;
}
