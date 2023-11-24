import { _getContractor } from "@/app/_actions/contractors/contractor-overview";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Contractor"
};
export default async function ContractorOverviewPage({ searchParams, params }) {
    const data = await _getContractor(+params.contractorId);
    if (!data) redirect("/contractor/contractors");
    return (
        <DataPageShell data={data} className="space-y-4 sm:px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Contractor" />
                <BreadLink link="/contractor/contractors" title="Contractors" />
                <BreadLink isLast title={data.name} />
            </Breadcrumbs>
        </DataPageShell>
    );
}
