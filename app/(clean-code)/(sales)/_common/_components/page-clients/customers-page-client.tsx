"use client";
import {
    DataTable,
    InfiniteDataTablePageProps,
} from "@/components/(clean-code)/data-table";
import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { GetCustomersDta } from "../../data-access/customer.dta";
import { TCell } from "@/components/(clean-code)/data-table/table-cells";
import { __filters } from "../../utils/contants";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";

export default function CustomersPageClient(props: InfiniteDataTablePageProps) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Name", "name", NameCell),
                ...__filters().customers.filterColumns,
            ];
        },
        filterFields: props.filterFields,
        cellVariants: {
            size: "sm",
        },
    });

    return (
        <div className="bg-white">
            <DataTable.Infinity
                checkable
                queryKey={props.queryKey}
                {...table.props}
            >
                {/* <DataTable.BatchAction></DataTable.BatchAction> */}
                <DataTable.Header className="bg-white">
                    <div className="flex justify-between items-end mb-2 gap-2 sm:sticky"></div>
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <DataTableFilterCommand />
                        </div>
                        <DataTableInfinityToolbar />
                    </div>
                </DataTable.Header>
                <DataTable.Table />
                <DataTable.LoadMore />
            </DataTable.Infinity>
        </div>
    );
}
interface ItemProps {
    item: GetCustomersDta["data"][number];
}
function NameCell({ item }: ItemProps) {
    return (
        <TCell>
            <TCell.Primary>{item.name || item.businessName}</TCell.Primary>
        </TCell>
    );
}
