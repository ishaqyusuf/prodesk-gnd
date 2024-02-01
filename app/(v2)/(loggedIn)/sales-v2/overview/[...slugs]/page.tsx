import { Metadata } from "next";
import { getSalesOverview } from "../_actions/get-sales-overview";
import OverviewShell from "../components/overview-shell";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import SalesProductionModal from "@/components/_v1/modals/sales-production-modal";
import SalesTimelineModal from "@/components/_v1/modals/sales-timeline-modal";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import DeletePaymentPrompt from "@/components/_v1/modals/delete-payment-prompt";

export const metadata: Metadata = {
    title: "Sales Overview",
    description: "",
};

export default async function SalesOverviewPage({ params: { slugs } }) {
    const [type, slug] = slugs;

    const data = getSalesOverview({ type, slug });

    return (
        <div className="">
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Orders" link="/sales/orders" />
            </Breadcrumbs>
            <OverviewShell data={data} />
            <SalesProductionModal />
            <SalesTimelineModal />
            <SalesPaymentModal />
            <OrderPrinter />
            <DeletePaymentPrompt />
        </div>
    );
}
