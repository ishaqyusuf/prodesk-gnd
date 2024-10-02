import OrdersPageClient from "../../../_common/_components/orders-page-client";
import { getSalesOrderListUseCase } from "../../../_common/use-case/sales-list-use-case";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";

export default async function SalesBookPage({ searchParams }) {
    const promise = getSalesOrderListUseCase(searchParams);
    return (
        <FPage title="Orders">
            <OrdersPageClient promise={promise} />
        </FPage>
    );
}
