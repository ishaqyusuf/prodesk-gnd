import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink, OrderViewCrumb } from "@/components/_v1/breadcrumbs/links";
import DeletePaymentPrompt from "@/components/_v1/modals/delete-payment-prompt";
import SalesPaymentModal from "@/components/_v1/modals/sales-payment-modal";
import SalesProductionModal from "@/components/_v1/modals/sales-production-modal";
import SalesTimelineModal from "@/components/_v1/modals/sales-timeline-modal";
import OrderPrinter from "@/components/_v1/print/order/order-printer";
import CostBreakdown from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/cost-breakdown";
import OverviewDetailsSection from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/details-section";
import PaymentHistory from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/payment-history";
import TabbedItemEmailOverview from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/tabbed-item-email-overview";
import Timeline from "@/app/(v1)/(loggedIn)/sales/order/[slug]/components/timeline";
import { DataPageShell } from "@/components/_v1/shells/data-page-shell";
import { prisma } from "@/db";
import { ISalesOrder, ISalesOrderMeta } from "@/types/sales";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalesOverview } from "./type";
import AuthGuard from "@/components/_v1/auth-guard";

export const metadata: Metadata = {
    title: "Order Overview",
    description: "Order Overview",
};

export default async function SalesOrderPage({ params: { slug } }) {
    const order: SalesOverview = (await getOrderAction(slug)) as any;
    if (!order) return notFound();
    metadata.description = order.orderId;

    // fix dissapered prices
    // const fixOrders = await prisma.salesOrderItems.findMany({
    //     where: {
    //         total: 0,
    //         qty: {
    //             gt: 0,
    //         },
    //     },
    //     include: {
    //         salesOrder: {
    //             select: {
    //                 orderId: true,
    //                 type: true,
    //             },
    //         },
    //     },
    // });
    // const slugs = new Set<string[]>([]);
    // await Promise.all(
    //     fixOrders.map(async (item) => {
    //         const meta: ISalesOrderMeta = item.meta as any;
    //         if (meta.cost_price > 0) {
    //             slugs.add(
    //                 `${item.salesOrder?.type}/${item.salesOrder?.orderId}` as any
    //             );
    //             await prisma.salesOrderItems.update({
    //                 where: {
    //                     id: item.id,
    //                 },
    //                 data: {
    //                     rate: meta.cost_price,
    //                     price: meta.cost_price,
    //                     total: Number(meta.cost_price) * (item.qty || 0),
    //                 },
    //             });
    //         }
    //     })
    // );

    // console.log(order.i);
    return (
        <AuthGuard can={["editOrders"]}>
            <DataPageShell className="sm:px-8" data={order}>
                <Breadcrumbs>
                    <BreadLink isFirst title="Sales" />
                    <BreadLink title="Orders" link="/sales/orders" />
                    <OrderViewCrumb slug={order.orderId} isLast />
                </Breadcrumbs>

                <div className="grid sm:grid-cols-3 gap-4 ">
                    <div className="sm:col-span-2 max-sm:divide-y flex flex-col space-y-4">
                        <OverviewDetailsSection />
                        {/* <ItemDetailsSection /> */}
                        <TabbedItemEmailOverview />
                    </div>
                    <div className="space-y-4 max-sm:divide-y">
                        <CostBreakdown />
                        <PaymentHistory />
                        <Timeline />
                    </div>
                </div>
                <SalesProductionModal />
                <SalesTimelineModal />
                <SalesPaymentModal />
                <OrderPrinter />
                <DeletePaymentPrompt />
            </DataPageShell>
        </AuthGuard>
    );
}