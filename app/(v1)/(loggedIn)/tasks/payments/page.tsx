import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { queryParams } from "@/app/(v1)/_actions/action-utils";

import HrmLayout from "@/components/_v1/tab-layouts/hrm-layout";
import {
    getJobPayments,
    getMyPayments,
} from "@/app/(v1)/_actions/hrm-jobs/get-payments";
import JobPaymentTableShell from "@/components/_v1/shells/job-payment-table-shell";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";

export const metadata: Metadata = {
    title: "Employees",
};
export default async function MyJobPaymentsPage({ searchParams }) {
    const response = await getMyPayments(queryParams(searchParams));
    return (
        <AuthGuard
            can={[["viewInstallation", "viewDecoShutterInstall", "viewTech"]]}
        >
            <div className="space-y-4 flex flex-col">
                <Breadcrumbs>
                    <BreadLink isFirst title="Hrm" />
                    <BreadLink isLast title="Payments" />
                </Breadcrumbs>
                <PageHeader title="My Payments" />
                <JobPaymentTableShell
                    searchParams={searchParams}
                    {...response}
                />
            </div>
        </AuthGuard>
    );
}
