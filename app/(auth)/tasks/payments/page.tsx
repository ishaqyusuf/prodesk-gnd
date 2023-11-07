import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import HrmLayout from "@/components/tab-layouts/hrm-layout";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import {
    getJobPayments,
    getMyPayments
} from "@/app/_actions/hrm-jobs/get-payments";
import JobPaymentTableShell from "@/components/shells/job-payment-table-shell";

export const metadata: Metadata = {
    title: "Employees"
};
export default async function MyJobPaymentsPage({ searchParams }) {
    const response = await getMyPayments(queryParams(searchParams));
    return (
        <div className="space-y-4 flex flex-col">
            <Breadcrumbs>
                <BreadLink isFirst title="Hrm" />
                <BreadLink isLast title="Payments" />
            </Breadcrumbs>
            <PageHeader title="My Payments" />
            <JobPaymentTableShell searchParams={searchParams} {...response} />
            <JobOverviewSheet admin={true} />
        </div>
    );
}
