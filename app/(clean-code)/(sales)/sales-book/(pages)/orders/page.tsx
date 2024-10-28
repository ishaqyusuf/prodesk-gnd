import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import OrdersPageClient from "../../../_common/_components/orders-page-client";
import { getSalesOrderInfinityListUseCase } from "../../../_common/use-case/sales-list-use-case";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { getQueryClient } from "@/providers/get-query-client";
import { dataOptions } from "@/components/(clean-code)/data-table/query-options";

export default async function SalesBookPage({ searchParams }) {
    // const promise = getSalesOrderListUseCase(searchParams);
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(
        dataOptions(search, getSalesOrderInfinityListUseCase)
    );
    return (
        <FPage title="Orders">
            <OrdersPageClient />
        </FPage>
    );
}
