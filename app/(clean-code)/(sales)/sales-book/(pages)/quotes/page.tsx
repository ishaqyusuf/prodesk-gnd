import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { getQueryClient } from "@/providers/get-query-client";
import {
    salesFilterFields,
    staticOrderFilters,
} from "../../../_common/_schema/base-order-schema";

import QuotesPageClient from "../../../_common/_components/page-clients/quote-page-client";
import { getSalesPageQueryDataDta } from "../../../_common/data-access/sales-page-query-data";
import { composeFilter } from "@/components/(clean-code)/data-table/filter-command/filters";
import { __filters } from "../../../_common/utils/contants";

export default async function SalesBookQuotePage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    const { queryKey, filterFields } = composeFilter(
        "quotes",
        __filters.quotes
    );
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));

    return (
        <FPage title="Quotes">
            <QuotesPageClient
                queryKey={queryKey}
                filterFields={filterFields}
                searchParams={searchParams}
            />
        </FPage>
    );
}
