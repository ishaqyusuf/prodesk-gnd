import { Metadata } from "next";
import { _getSalesCommissionsAction } from "../_actions/get-sales-commissions";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import CommissionsLayout from "./commissions-layout";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import PageHeader from "@/components/_v1/page-header";
import CommissionsTable from "./commissions-table";
export const metadata: Metadata = {
    title: "Sales Commissions",
};
export default async function SalesCommissions({ searchParams }) {
    const resp = await _getSalesCommissionsAction({
        ...queryParams(searchParams),
    });

    return (
        <CommissionsLayout query={searchParams}>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Commissions" />
            </Breadcrumbs>
            <PageHeader title="Sales Commissions" />
            <CommissionsTable searchParams={searchParams} {...resp} />
        </CommissionsLayout>
    );
}
