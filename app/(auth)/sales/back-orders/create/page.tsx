import { Breadcrumbs } from "@/components/breadcrumbs";
import { BreadLink } from "@/components/breadcrumbs/links";
import { Metadata } from "next";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { DataPageShell } from "@/components/shells/data-page-shell";
import LoadDelivery from "@/components/sales/load-delivery/load-delivery";
import InspectBackOrderModal from "@/components/modals/sales/inspect-back-order-modal";
export const metadata: Metadata = {
    title: "Create Back Order"
};
interface Props {}
export default async function LoadDeliveryPage({ searchParams }) {
    const orderIds = searchParams.orderIds?.split(",");
    if (!orderIds.length) redirect("/sales/orders");
    const orders = await prisma.salesOrders.findMany({
        where: {
            slug: {
                in: orderIds
            }
        },
        include: {
            items: true,
            customer: true,
            shippingAddress: true
        }
    });
    const data = { orders, action: "create" };
    return (
        <DataPageShell data={data} className="sm:px-8 space-y-4">
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="Delivery" link={"/sales/delivery"} />
                <BreadLink isLast title="Loading" />
            </Breadcrumbs>

            <LoadDelivery title={"Create"} />
            <InspectBackOrderModal />
        </DataPageShell>
    );
}