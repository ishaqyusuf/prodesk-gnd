import PageHeader from "@/components/page-header";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";

import { queryParams } from "@/app/_actions/action-utils";

import HrmLayout from "@/components/hrm/hrm-layout";
import JobOverviewSheet from "@/components/sheets/job-overview-sheet";
import { getJobPayments } from "@/app/_actions/hrm-jobs/get-payments";
import JobPaymentTableShell from "@/components/shells/job-payment-table-shell";

export const metadata: Metadata = {
  title: "Employees",
};
export default async function EmployeesPage({ searchParams }) {
  const response = await getJobPayments(queryParams(searchParams));
  return (
    <HrmLayout>
      <Breadcrumbs>
        <BreadLink isFirst title="Hrm" />
        <BreadLink isLast title="Payments" />
      </Breadcrumbs>
      <PageHeader
        title="Payments"
        newLink={"/hrm/payments/pay"}
        buttonText={"Make Payment"}
        ButtonIcon={"dollar"}
      />
      <JobPaymentTableShell {...response} />
      <JobOverviewSheet />
    </HrmLayout>
  );
}
