import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import SalesProductionTableShell from "@/app/(v1)/(loggedIn)/sales/productions/sales-production-table-shell";
import {
    getSalesProductionsAction,
    prodsDueToday,
} from "@/app/(v1)/_actions/sales/sales-production";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import {
    BreadLink,
    ProductionsCrumb,
} from "@/components/_v1/breadcrumbs/links";
import { Metadata } from "next";
import { formatDate } from "@/lib/use-day";
import dayjs from "dayjs";
import AuthGuard from "@/components/_v1/auth-guard";
export const metadata: Metadata = {
    title: "Sales Production",
    description: "",
};
interface Props {}
export default async function SalesProductionPage({ searchParams }) {
    const response = await getSalesProductionsAction(
        queryParams(searchParams),
        true
    );
    const todaysProd = await prodsDueToday(true);
    return (
        <AuthGuard can={["viewOrderProduction"]}>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <ProductionsCrumb isLast />
            </Breadcrumbs>

            <div className="space-y-4 px-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Due Today
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2"></div>
                </div>
                <SalesProductionTableShell<ISalesOrder>
                    simple
                    {...todaysProd}
                />
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Productions
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2"></div>
                </div>
                <SalesProductionTableShell<ISalesOrder>
                    searchParams={searchParams}
                    {...response}
                />
                <OrderPrinter />
            </div>
        </AuthGuard>
    );
}
