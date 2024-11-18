import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { getQueryClient } from "@/providers/get-query-client";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import DeliveryPageClient from "../../../_common/_components/page-clients/delivery-page-client";

export default async function DispatchPage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    const queryKey = "sales-delivery";
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));
    return (
        <FPage className="" title="Sales Delivery">
            <DeliveryPageClient queryKey={queryKey} />
        </FPage>
    );
}
