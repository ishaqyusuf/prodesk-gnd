import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { getQueryClient } from "@/providers/get-query-client";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import DispatchPageClient from "../../../_common/_components/pag-clients/dispatch-page-client";

export default async function DispatchPage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    const queryKey = "sales-delivery";
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));
    return (
        <FPage className="" title="Dispatch">
            <DispatchPageClient queryKey={queryKey} />
        </FPage>
    );
}
