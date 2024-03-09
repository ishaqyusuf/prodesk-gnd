import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import AccountingTab from "./components/accounting-tab";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";

export default async function AccountingPage({ searchParams }) {
    return (
        <div>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Commissions" />
            </Breadcrumbs>
            <AccountingTab />
        </div>
    );
}
