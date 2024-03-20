import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import AccountingTab from "./accounting-tab";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import PageShell from "@/_v2/components/page-shell";
import PageHeader from "@/components/_v1/page-header";
import SalesPaymentTableShell from "@/components/_v1/shells/sales-payment-table-shell";
import { getsalesPayments } from "@/app/(v1)/_actions/sales-payment/crud";
import { queryParams } from "@/app/(v1)/_actions/action-utils";

export default async function AccountingPage(props) {
    const response = await getsalesPayments(queryParams(props.searchParams));
    return (
        <PageShell>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Commissions" />
            </Breadcrumbs>
            <AccountingTab />
            <PageHeader title="Sales Payments" />
            <SalesPaymentTableShell
                searchParams={props.searchParams}
                {...response}
            />
        </PageShell>
    );
}
