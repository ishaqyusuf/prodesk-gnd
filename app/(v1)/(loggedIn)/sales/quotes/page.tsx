import { getSalesEstimates } from "@/app/(v1)/(loggedIn)/sales/_actions/sales";

import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";

import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesTabLayout from "@/components/_v1/tab-layouts/sales-tab-layout";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { Metadata } from "next";
import { prisma } from "@/db";
import EstimatesTableShell from "./estimates-table-shell";

export const metadata: Metadata = {
    title: "Sales Quote",
};
interface Props {}

export default async function SalesEstimatesPage({ searchParams }) {
    const response = await getSalesEstimates(queryParams(searchParams));
    return (
        <AuthGuard can={["viewEstimates"]}>
            <SalesTabLayout>
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink isLast title="Quotes" />
                </Breadcrumbs>

                <EstimatesTableShell
                    searchParams={searchParams}
                    {...response}
                />
                <OrderPrinter />
            </SalesTabLayout>
        </AuthGuard>
    );
}
