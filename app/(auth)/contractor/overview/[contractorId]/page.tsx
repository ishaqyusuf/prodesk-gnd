import { _getContractor } from "@/app/_actions/contractors/contractor-overview";
import { getPayableUsers } from "@/app/_actions/hrm-jobs/make-payment";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { StartCard, StatCardContainer } from "@/components/stat-card";
import { prisma } from "@/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Contractor"
};
export default async function ContractorOverviewPage({ searchParams, params }) {
    const userId = +params.contractorId;
    const data = await _getContractor(userId);
    const { payables, jobs } = await getPayableUsers(userId);
    const payable = payables[0];
    console.log(payable);
    if (!data || !payable) redirect("/contractor/contractors");
    return (
        <DataPageShell data={data} className="space-y-4 sm:px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Contractor" />
                <BreadLink link="/contractor/contractors" title="Contractors" />
                <BreadLink isLast title={data.name} />
            </Breadcrumbs>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    {data?.name}
                </h2>
                <div className="flex items-center space-x-2">
                    {/* <DatePicker /> */}
                    {/* <CustomerMenu customer={customer} /> */}
                </div>
            </div>
            <div className="space-y-4">
                <StatCardContainer>
                    <StartCard
                        icon="dollar"
                        value={payable.total}
                        label="Pending Payment"
                        money
                    />
                    <StartCard
                        icon="dollar"
                        value={0}
                        label="Total Sales"
                        money
                    />
                    <StartCard
                        icon="dollar"
                        value={0}
                        label="Amount Due"
                        money
                    />
                    <StartCard
                        label="Total Orders"
                        icon="lineChart"
                        value={0}
                        info={`${0 || 0} completed`}
                    />
                    {/* <StartCard
            icon="line"
            label="Doors Ordered"
            value={totalDoors}
            info={`${completedDoors || 0} completed`}
          /> */}
                </StatCardContainer>
            </div>
        </DataPageShell>
    );
}
