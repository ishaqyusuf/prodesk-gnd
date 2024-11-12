import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import OrdersPageClient from "../../../_common/_components/orders-page-client";
import { getSalesOrderInfinityListUseCase } from "../../../_common/use-case/sales-list-use-case";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { getQueryClient } from "@/providers/get-query-client";
import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { redirect } from "next/navigation";
import { __isProd } from "@/lib/is-prod-server";
// export const revalidate = 0;
// export const dynamic = "force-dynamic";
export default async function SalesBookPage({ searchParams }) {
    // const promise = getSalesOrderListUseCase(searchParams);
    if (Object.keys(searchParams).length == 0 && __isProd)
        redirect("/sales-book/orders?digest=");

    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(
        dataOptions(search, getSalesOrderInfinityListUseCase)
    );
    return (
        <FPage className="" title="Orders">
            <OrdersPageClient searchParams={searchParams} />
        </FPage>
    );
}
