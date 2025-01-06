import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import OrdersPageClient from "../../../_common/_components/page-clients/orders-page-client";

import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import { __isProd } from "@/lib/is-prod-server";
import { getQueryClient } from "@/providers/get-query-client";
import { dataOptions } from "@/components/(clean-code)/data-table/query-options";

import { getSalesPageQueryDataDta } from "../../../_common/data-access/sales-page-query-data";
import { composeFilter } from "@/components/(clean-code)/data-table/filter-command/filters";
import { __filters } from "../../../_common/utils/contants";
import { constructMetadata } from "@/lib/(clean-code)/construct-metadata";
import { generateRandomString } from "@/lib/utils";
import Portal from "@/components/_v1/portal";
import NewFeatureBtn from "@/components/common/new-feature-btn";

export async function generateMetadata({}) {
    return constructMetadata({
        title: `Sales List - gndprodesk.com`,
    });
}
export default async function SalesBookPage({ searchParams }) {
    const search = searchParamsCache.parse(searchParams);
    const queryClient = getQueryClient();
    const { queryKey, filterFields } = composeFilter(
        "orders",
        await getSalesPageQueryDataDta()
    );
    await queryClient.prefetchInfiniteQuery(dataOptions(search, queryKey));
    return (
        <FPage className="" title="Orders">
            <Portal nodeId={"navRightSlot"}>
                <NewFeatureBtn href="/sales/orders">Old Site</NewFeatureBtn>
            </Portal>
            <OrdersPageClient queryKey={queryKey} filterFields={filterFields} />
        </FPage>
    );
}
