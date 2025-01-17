import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { getQueryClient } from "@/providers/get-query-client";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import DeliveryPageClient from "../_components/delivery-page-client";
import { composeFilter } from "@/components/(clean-code)/data-table/filter-command/filters";

export default async function DispatchPage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    // const queryKey = "sales-delivery";
    const { queryKey, filterFields } = composeFilter(
        "sales-delivery"
        //  await getSalesPageQueryDataDta()
    );
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));
    return (
        <FPage className="" title="Sales Delivery">
            <DeliveryPageClient
                queryKey={queryKey}
                filterFields={filterFields}
            />
        </FPage>
    );
}
