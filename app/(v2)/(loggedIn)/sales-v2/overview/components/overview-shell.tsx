"use client";

import React from "react";
import { getSalesOverview } from "../_actions/get-sales-overview";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import DetailsSection from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/details-section";
import CostBreakdown from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/cost-breakdown";
import PaymentHistory from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/payment-history";
import Timeline from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/timeline";
import OverviewTabs from "./overview-tabs";
import SalesItemsOverview from "./sales-items-overview";

export type SalesOverviewType = Awaited<ReturnType<typeof getSalesOverview>>;
interface Props {
    data: Promise<SalesOverviewType>;
}
export default function OverviewShell({ data }: Props) {
    const resp = React.use(data);
    if (!resp) return null;
    return (
        <DataPageShell data={resp}>
            <div className="grid sm:grid-cols-3 gap-4 ">
                <div className="sm:col-span-2 max-sm:divide-y flex flex-col space-y-4">
                    <DetailsSection />
                    {/* <OverviewTabs /> */}
                    <SalesItemsOverview />
                    {/* <ItemDetailsSection /> */}
                    {/* <TabbedItemEmailOverview /> */}
                </div>
                <div className="space-y-4 max-sm:divide-y">
                    <CostBreakdown />
                    {resp.type == "order" && <PaymentHistory />}
                    <Timeline />
                </div>
            </div>
        </DataPageShell>
    );
}
