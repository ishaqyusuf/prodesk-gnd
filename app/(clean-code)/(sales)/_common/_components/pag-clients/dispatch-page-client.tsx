"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import {
    dispatchFilterFields,
    dispatchSearchSchema,
} from "../../_schema/dispatch-search-schema";
import { getSalesDispatchListUseCase } from "../../use-case/sales-dispatch-use-case";
import { DataTable } from "@/components/(clean-code)/data-table";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import DispatchOverviewSheet from "../overviews/dispatch-overview-sheet";

interface Props {
    queryKey?;
}
export default function DispatchPageClient({ queryKey }: Props) {
    const table = useTableCompose({
        cells(ctx) {
            return [];
        },
        checkable: true,
        schema: dispatchSearchSchema,
        filterFields: dispatchFilterFields,
        serverAction: getSalesDispatchListUseCase,
        cellVariants: {
            size: "sm",
        },
        passThroughProps: {},
    });

    return (
        <div>
            <DataTable.Infinity queryKey={queryKey} {...table.props}>
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <DataTableFilterCommand />
                    </div>
                    <DataTableInfinityToolbar />
                </div>
                <DataTable.Table />
                <DataTable.LoadMore />
                <DispatchOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
