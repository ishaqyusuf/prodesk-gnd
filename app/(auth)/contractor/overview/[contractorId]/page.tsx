import { DataPageShell } from "@/components/shells/data-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contractor"
};
export default async function ContractorOverviewPage({ searchParams, params }) {
    return <DataPageShell></DataPageShell>;
}
