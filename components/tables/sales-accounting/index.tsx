"use client";

import { __filters } from "@/app/(clean-code)/(sales)/_common/utils/contants";
import {
    DataTable,
    InfiniteDataTablePageProps,
} from "@/components/(clean-code)/data-table";
import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { ActionCell, DateCol } from "./columns";
import QueryTab from "@/app/(clean-code)/_common/query-tab";
import { QueryTabAction } from "@/app/(clean-code)/_common/query-tab/query-tab-edit";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";

export default function SalesAccountingTable({
    filterFields,
    queryKey,
}: InfiniteDataTablePageProps) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Due Date", "date", DateCol),
                // ctx.Column("Due", "alert", Cells.Alert),
                // ctx.Column("Order #", "order.no", Cells.Order),
                // ctx.Column("Sales Rep", "sales.rep", Cells.SalesRep),
                // // ctx.Column("Assigned To", "assignments", Cells.Assignments),
                // ctx.Column("Status", "status", Cells.Status),
                // ...__filters()["sales-productions"].filterColumns,
            ];
        },
        filterFields,
        cellVariants: {
            size: "sm",
        },
        passThroughProps: {
            itemClick(item) {
                // _modal.openSheet();
            },
        },
    });

    return (
        <div className="bg-white">
            <DataTable.Infinity
                checkable
                ActionCell={ActionCell}
                queryKey={queryKey}
                itemViewFn={(item) => {
                    // openSalesProductionTasksModal({
                    //     salesId: item.id,
                    // });
                }}
                {...table.props}
            >
                <DataTable.BatchAction>
                    {/* <Menu>
                        <Menu.Trash action={() => {}}>Delete</Menu.Trash>
                    </Menu> */}
                </DataTable.BatchAction>
                <DataTable.Header top="sm" className="bg-white">
                    <div className="flex justify-between items-end mb-2 gap-2 sm:sticky">
                        <div className="">
                            <QueryTab page="orders" />
                        </div>
                        <div className="flex-1"></div>
                        <QueryTabAction />
                        {/* <Button
                            onClick={() => {
                                openTxForm({});
                            }}
                            variant="destructive"
                            size="sm"
                        >
                            <Icons.dollar className="size-4 mr-2" />
                            <span>Pay Portal</span>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/sales-book/create-order">
                                <Icons.add className="size-4 mr-2" />
                                <span>New</span>
                            </Link>
                        </Button> */}
                    </div>
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
