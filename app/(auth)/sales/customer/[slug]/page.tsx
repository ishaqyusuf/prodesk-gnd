import { getCustomerAction } from "@/app/_actions/sales/sales-customers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import RecentPayments from "@/components/sales/customers/recent-payments";
import RecentSalesCard from "@/components/sales/recent-sales-card";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICustomer } from "@/types/customers";
import { DollarSign, Plus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Overview",
};
export default async function CustomerPage({ searchParams, params }) {
  const response = await getCustomerAction(+params.slug);
  const { customer } = response;
  metadata.title = `${customer?.name} | Overview`;
  const {
    salesOrders,
    totalDoors,
    pendingDoors,
    totalCost,
    amountDue,
    completedOrders,
    completedDoors,
    pendingOrders,
  } = customer._count;
  //   console.log(customer._count);
  return (
    <DataPageShell<ICustomer> data={customer} className="space-y-4 px-8">
      <Breadcrumbs>
        <BreadLink isFirst link="sales/customers" title="Customers" />
        <BreadLink isLast title={customer.name} />
      </Breadcrumbs>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{customer?.name}</h2>
        <div className="flex items-center space-x-2">
          {/* <CalendarDateRangePicker /> */}
          <Button className="h-8">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>
      {/* <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
        </TabsList> */}
      {/* <TabsContent value="overview" className="space-y-4"> */}
      <div className="space-y-4">
        <StatCardContainer>
          <StartCard
            icon="dollar"
            value={totalCost}
            label="Total Sales"
            money
          />
          <StartCard icon="dollar" value={amountDue} label="Amount Due" money />
          <StartCard
            label="Total Orders"
            icon="line"
            value={salesOrders}
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
          <RecentSalesCard className="col-span-4" />
          <RecentPayments className="col-span-3" />
        </div>
      </div>
      {/* </TabsContent> */}
      {/* </Tabs> */}
    </DataPageShell>
  );
}
