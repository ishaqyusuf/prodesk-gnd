import { salesDashboardAction } from "@/app/_actions/dashboard/sales-dashboard";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import BarChartComponent from "@/components/charts/bar-chart";
import Portal from "@/components/portal";
import RecentSalesDashboardCard from "@/components/sales/recent-sales-dashboard-card";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Dashboard",
};

interface Props {}
export default async function SalesDashboardPage({}: Props) {
  const salesDashboard = await salesDashboardAction();
  const {
    totalSales,
    amountDue,
    totalDoors,
    completedOrders,
    completedDoors,
    totalOrders,
  } = salesDashboard;
  return (
    <DataPageShell className="space-y-4" data={salesDashboard}>
      <Breadcrumbs>
        <BreadLink isFirst title="Dashboard" />
        <BreadLink isLast title="Sales" />
      </Breadcrumbs>
      <Portal nodeId="dashboardTitle">Sales Dashboard</Portal>

      <StatCardContainer>
        <StartCard masked icon="dollar" value={totalSales} label="Total Sales" money />
        <StartCard masked icon="dollar" value={amountDue} label="Amount Due" money />
        <StartCard
          label="Total Orders"
          icon="line"
          value={totalOrders}
          info={`${completedOrders || 0} completed`}
        />
        <StartCard
          icon="line"
          label="Doors Ordered"
          value={totalDoors}
          info={`${completedDoors || 0} completed`}
        />
      </StatCardContainer>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChartComponent data={salesDashboard.bar || []} />
          </CardContent>
        </Card>
        <RecentSalesDashboardCard className="md:col-span-1 lg:col-span-3" />
      </div>
    </DataPageShell>
  );
}
