"use client";

import { ServerPromiseType } from "@/types";
import React from "react";
import { _getProductionList } from "../actions";
import useDataTableColumn from "@/components/common/data-table/columns/use-data-table-columns";
import { DataTable2 } from "@/components/_v1/data-table/data-table-2";
import { ProductionCells } from "./sales-prod-cells";

interface Props {
    promise;
    prod?: boolean;
}
type DataServerPromiseType = ServerPromiseType<typeof _getProductionList>;
export type ProductionListItemType = DataServerPromiseType["Item"];
export default function ProductionList({ promise, prod }: Props) {
    const { data, pageCount }: DataServerPromiseType["Response"] =
        React.use(promise);
    const table = useDataTableColumn(
        data,
        (ctx) =>
            prod
                ? [
                      ctx.Column("Order", ProductionCells.Order),
                      ctx.Column("Sales Rep", ProductionCells.SalesRep),
                      ctx.Column("Due Date", ProductionCells.DueDate),
                      ctx.Column("Status", ProductionCells.ProductionStatus),
                      ctx.ActionColumn(ProductionCells.ProdActions),
                  ]
                : [
                      ctx.Column("Order", ProductionCells.Order),
                      ctx.Column("Sales Rep", ProductionCells.SalesRep),
                      ctx.Column("Status", ProductionCells.Status),
                      ctx.Column(
                          "Production",
                          ProductionCells.ProductionStatus
                      ),
                      ctx.Column("Assigned To", ProductionCells.AssignedTo),
                      ctx.ActionColumn(ProductionCells.Actions),
                  ],
        true,
        {
            filterCells: ["_q", "_date"],
        }
    );

    return (
        <div>
            <DataTable2
                columns={table.columns}
                data={data}
                searchableColumns={[
                    {
                        id: "_q" as any,
                        title: "products",
                    },
                ]}
                filterableColumns={[
                    {
                        id: "status",
                        title: "Status",
                        single: true,
                        options: [
                            { label: "Started", value: "Started" },
                            { label: "Queued", value: "Queued" },
                            { label: "Completed", value: "Completed" },
                            { label: "Late", value: "Late" },
                        ],
                    },
                ]}
                pageCount={pageCount}
            ></DataTable2>
        </div>
    );
}
