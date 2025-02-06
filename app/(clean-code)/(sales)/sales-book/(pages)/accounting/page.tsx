import { composeFilter } from "@/components/(clean-code)/data-table/filter-command/filters";
import { dataOptions } from "@/components/(clean-code)/data-table/query-options";
import { searchParamsCache } from "@/components/(clean-code)/data-table/search-params";
import FPage from "@/components/(clean-code)/fikr-ui/f-page";
import SalesAccountingTable from "@/components/tables/sales-accounting";
import TablePage from "@/components/tables/table-page";
import { getQueryClient } from "@/providers/get-query-client";

export default async function Page({ searchParams }) {
    return (
        <FPage can={["viewOrders"]} title="Accounting">
            <TablePage
                filterKey="sales-accounting"
                searchParams={searchParams}
                PageClient={SalesAccountingTable}
            />
        </FPage>
    );
}
