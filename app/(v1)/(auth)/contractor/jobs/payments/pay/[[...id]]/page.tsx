import { getJobs } from "@/app/(v1)/_actions/hrm-jobs/get-jobs";
import { getPayableUsers } from "@/app/(v1)/_actions/hrm-jobs/make-payment";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import {
    PrimaryCellContent,
    SecondaryCellContent,
} from "@/components/_v1/columns/base-columns";
import JobPaymentForm from "@/components/_v1/forms/job-payment-form";
import HrmLayout from "@/components/_v1/tab-layouts/hrm-layout";
import Money from "@/components/_v1/money";
import PageHeader from "@/components/_v1/page-header";
import JobTableShell from "@/components/_v1/shells/job-table-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import TabbedLayout from "@/components/_v1/tab-layouts/tabbed-layout";
import JobOverviewSheet from "@/components/_v1/sheets/job-overview-sheet";
import EditJobModal from "@/components/_v1/modals/edit-job";
import SubmitJobModal from "@/app/(v1)/(auth)/tasks/submit-job/submit-job-modal";
export const metadata: Metadata = {
    title: "Payment Portal",
};
export default async function PaymentPage({ params }) {
    const userId = params?.id?.[0];
    const { payables, jobs } = await getPayableUsers(userId);
    const user = payables?.find((u) => u.id == userId);
    if (user) metadata.title = user.name;

    return (
        <TabbedLayout tabKey="Job">
            <Breadcrumbs>
                <BreadLink isFirst title="Hrm" />
                <BreadLink isLast title="Payment Portal" />
            </Breadcrumbs>
            <PageHeader
                title={
                    user
                        ? user.name
                        : !payables.length
                        ? "No Pending Payment"
                        : "Make Payment"
                }
            />
            <div className="flex gap-4">
                <div className="flex flex-col divide-y">
                    {payables.map((user) => (
                        <Link
                            key={user.id}
                            href={`/contractor/jobs/payments/pay/${user.id}`}
                            className={cn(
                                "p-2 text-sm pr-4",
                                userId == user.id
                                    ? "bg-accent"
                                    : "hover:bg-accent"
                            )}
                        >
                            <div className="font-medium">{user.name}</div>
                            <SecondaryCellContent className="flex justify-start">
                                <Money className="text-sm" value={user.total} />
                            </SecondaryCellContent>
                        </Link>
                    ))}
                </div>
                <div className="flex-1">
                    {jobs && user && (
                        <div className="space-y-4">
                            <JobTableShell payment {...(jobs as any)} />
                            <JobPaymentForm user={user as any} />
                        </div>
                    )}
                </div>
            </div>
            <JobOverviewSheet />
            <EditJobModal />
            <SubmitJobModal />
        </TabbedLayout>
    );
}
