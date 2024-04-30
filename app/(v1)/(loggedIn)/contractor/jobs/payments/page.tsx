import PageHeader from "@/components/_v1/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

import { queryParams } from "@/app/(v1)/_actions/action-utils";

import { getJobPayments } from "@/app/(v1)/_actions/hrm-jobs/get-payments";
import JobPaymentTableShell from "@/components/_v1/shells/job-payment-table-shell";
import TabbedLayout from "@/components/_v1/tab-layouts/tabbed-layout";
import PaymentOverviewSheet from "@/components/_v1/sheets/payment-overview-sheet";
import AuthGuard from "@/components/_v1/auth-guard";

export const metadata: Metadata = {
    title: "Payment Receipts",
};
export default async function JobPaymentsPage({ searchParams }) {
    const response = await getJobPayments(queryParams(searchParams));
    return (
        <TabbedLayout tabKey="Job">
            <Breadcrumbs>
                <BreadLink isFirst title="Hrm" />
                <BreadLink isLast title="Payments" />
            </Breadcrumbs>
            <PageHeader
                title="Payment Receipts"
                newLink={"/contractor/jobs/payments/pay"}
                buttonText={"Make Payment"}
                ButtonIcon={"dollar"}
            />
            <AuthGuard can={["editJobPayment"]}>
                <JobPaymentTableShell
                    searchParams={searchParams}
                    {...response}
                />
            </AuthGuard>
            <PaymentOverviewSheet />
        </TabbedLayout>
    );
}