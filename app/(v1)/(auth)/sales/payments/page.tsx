import {
    getSalesEstimates,
    getSalesOrder,
} from "@/app/(v1)/_actions/sales/sales";
import OrdersTableShell from "@/app/(v1)/(auth)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/(v1)/_actions/action-utils";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import EstimatesTableShell from "@/components/_v1/shells/estimates-table-shell";
import PageHeader from "@/components/_v1/page-header";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { getsalesPayments } from "@/app/(v1)/_actions/sales-payment/crud";
import SalesPaymentTableShell from "@/components/_v1/shells/sales-payment-table-shell";
import SelectSalesPaymentCustomerModal from "@/components/_v1/modals/select-sales-payment-customer-modal";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import DeletePaymentPrompt from "@/components/_v1/modals/delete-payment-prompt";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sales Payment",
};
interface Props {}
export default async function SalesPaymentPage({ searchParams }) {
    const response = await getsalesPayments(queryParams(searchParams));
    return (
        <div className="space-y-4 px-8">
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Payments" />
            </Breadcrumbs>
            <PageHeader
                title="Sales Payments"
                permissions={["editOrders"]}
                newDialog="salesPaymentCustomer"
            />
            <SalesPaymentTableShell searchParams={searchParams} {...response} />
            <SelectSalesPaymentCustomerModal />
            <SalesPaymentModal />
            <DeletePaymentPrompt />
        </div>
    );
}
