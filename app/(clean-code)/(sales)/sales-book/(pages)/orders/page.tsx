import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import OrdersPageClient from "../../../_common/_components/page-clients/orders-page-client";

import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { __isProd } from "@/lib/is-prod-server";
import { getQueryClient } from "@/providers/get-query-client";
import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { getSalesOrderInfinityListUseCase } from "../../../_common/use-case/sales-list-use-case";
import { composeFilter } from "@/components/(clean-code)/data-table/filter-compose";
import { salesFilterFields } from "../../../_common/_schema/base-order-schema";
import { getSalesPageQueryDataDta } from "../../../_common/data-access/sales-page-query-data";
// export const revalidate = 0;
// export const dynamic = "force-dynamic";
export default async function SalesBookPage({ searchParams }) {
    // const promise = getSalesOrderListUseCase(searchParams);
    // if (Object.keys(searchParams).length == 0 && __isProd)
    // redirect("/sales-book/orders?digest=");
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    const queryKey = "sales-orders";
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));
    const filterOptions = await getSalesPageQueryDataDta();
    const filterFields = composeFilter(salesFilterFields, filterOptions);
    return (
        <FPage className="" title="Orders">
            <OrdersPageClient
                queryKey={queryKey}
                filterFields={filterFields}
                searchParams={searchParams}
                filterOptions={filterOptions}
            />
        </FPage>
    );
}
