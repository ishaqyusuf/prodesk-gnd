import { getSalesEstimates, getSalesOrder } from "@/app/_actions/sales/sales";
import OrdersTableShell from "@/app/(auth)/sales/orders/components/orders-table-shell";
import { queryParams } from "@/app/_actions/action-utils";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import OrderPrinter from "@/components/print/order/order-printer";
import EstimatesTableShell from "@/components/shells/estimates-table-shell";
import PageHeader from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { getsalesPayments } from "@/app/_actions/sales-payment/crud";
import SalesPaymentTableShell from "@/components/shells/sales-payment-table-shell";
import SelectSalesPaymentCustomerModal from "@/components/modals/select-sales-payment-customer-modal";
import SalesPaymentModal from "@/components/modals/sales-payment-modal";
import DeletePaymentPrompt from "@/components/modals/delete-payment-prompt";
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
