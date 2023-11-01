import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import SalesProductionTableShell from "@/components/shells/sales-production-table-shell";
import {
    getSalesProductionsAction,
    prodsDueToday
} from "@/app/_actions/sales/sales-production";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductionsCrumb } from "@/components/breadcrumbs/links";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
export const metadata: Metadata = {
    title: "Sales Production",
    description: ""
};
interface Props {}
export default async function SalesProductionPage({ searchParams }) {
    const response = await getSalesProductionsAction(queryParams(searchParams));

    const todaysProd = await prodsDueToday();
    return (
        <div className="h-full flex-1 flex-col space-y-4">
            <Breadcrumbs>
                <ProductionsCrumb isLast />
            </Breadcrumbs>
            <div className="space-y-4 px-8">
                <PageHeader title="Due Today" />

                <SalesProductionTableShell<ISalesOrder>
                    simple
                    {...todaysProd}
                    myProd
                />
                <PageHeader title="Productions" />

                <SalesProductionTableShell<ISalesOrder>
                    myProd
                    searchParams={searchParams}
                    {...response}
                />
                <OrderPrinter />
            </div>
        </div>
    );
}

