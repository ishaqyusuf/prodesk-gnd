import AccountingTab from "../components/accounting-tab";
import getPayablesAction from "./get-payables";
import PayablesTable from "./payable-tables";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import PageShell from "@/_v2/components/page-shell";
import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payables",
};
export default async function PayablesPage({ searchParams }) {
    const promise = getPayablesAction(searchParams);

    return (
        <PageShell>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Commissions" />
            </Breadcrumbs>
            <AccountingTab />
            <PageHeader title="Payables" />
            <PayablesTable promise={promise} />
        </PageShell>
    );
}
