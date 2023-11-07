import { getCustomerAction } from "@/app/_actions/sales/sales-customers";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import CustomerMenu from "@/components/sales/customers/customer-menu";
import RecentPayments from "@/components/sales/customers/recent-payments";
import RecentSalesCard from "@/components/sales/recent-sales-card";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { ICustomer } from "@/types/customers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customer Overview"
};
export default async function CustomerPage({ searchParams, params }) {
    const response = await getCustomerAction(+params.slug);
    const { customer } = response;
    metadata.title = `${customer?.name} | Overview`;
    const {
        salesOrders,
        totalDoors,
        totalSales,
        amountDue,
        completedOrders,
        completedDoors
    } = customer._count;
    //   console.log(customer._count);
    return (
        <DataPageShell<ICustomer> data={customer} className="space-y-4 px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Contractor" />
                <BreadLink link="/contractor/contractors" title="Contractos" />
                <BreadLink isLast title={customer.name} />
            </Breadcrumbs>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    {customer?.name}
                </h2>
                <div className="flex items-center space-x-2">
                    {/* <DatePicker /> */}
                    <CustomerMenu customer={customer} />
                </div>
            </div>
            <div className="space-y-4">
                <StatCardContainer>
                    <StartCard
                        icon="dollar"
                        value={customer.wallet?.balance}
                        label="Wallet"
                        money
                    />
                    <StartCard
                        icon="dollar"
                        value={totalSales}
                        label="Total Sales"
                        money
                    />
                    <StartCard
                        icon="dollar"
                        value={amountDue}
                        label="Amount Due"
                        money
                    />
                    <StartCard
                        label="Total Orders"
                        icon="line"
                        value={salesOrders}
                        info={`${completedOrders || 0} completed`}
                    />
                    {/* <StartCard
            icon="line"
            label="Doors Ordered"
            value={totalDoors}
            info={`${completedDoors || 0} completed`}
          /> */}
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
