import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import { getQueryClient } from "@/providers/get-query-client";
import { getSalesDispatchListUseCase } from "../../../_common/use-case/sales-dispatch-use-case";

export default async function DispatchPage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    await queryClient.prefetchInfiniteQuery(
        dataOptions(search, getSalesDispatchListUseCase)
    );
    return <></>;
}
