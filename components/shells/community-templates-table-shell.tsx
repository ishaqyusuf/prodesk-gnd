"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
    CheckColumn,
    ColumnHeader,
    Cell,
    PrimaryCellContent,
    DateCellContent,
    SecondaryCellContent,
    _FilterColumn
} from "../columns/base-columns";

import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";

import { ICommunityTemplate } from "@/types/community";
import InstallCostCell from "../community/install-cost-cell";
import { ProjectsFilter } from "../filters/projects-filter";
import ModelCostCell, {
    CommunityModelCostCell
} from "../community/model-cost-cell";
import {
    RowActionCell,
    RowActionMenuItem,
    RowActionMoreMenu
} from "../data-table/data-table-row-actions";
import { _importModelCost } from "@/app/_actions/community/community-template";
import { toast } from "sonner";

export default function CommunityTemplateTableShell<T>({
    data,
    pageInfo,
    searchParams
}: TableShellProps<ICommunityTemplate>) {
    const [isPending, startTransition] = useTransition();

    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
    const columns = useMemo<ColumnDef<ICommunityTemplate, unknown>[]>(
        () => [
            CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
            {
                maxSize: 10,
                id: "id",
                header: ColumnHeader("#/Date"),
                cell: ({ row }) => (
                    <Cell>
                        <PrimaryCellContent>
                            {row.original.id}
                        </PrimaryCellContent>
                        <DateCellContent>
                            {row.original.createdAt}
                        </DateCellContent>
                    </Cell>
                )
            },
            {
                id: "project",
                header: ColumnHeader("Project"),
                cell: ({ row }) => (
                    <Cell>
                        <PrimaryCellContent>
                            {row.original.project?.title}
                        </PrimaryCellContent>
                        <SecondaryCellContent>
                            {row.original.project?.builder?.name}
                        </SecondaryCellContent>
                    </Cell>
                )
            },
            {
                id: "model",
                header: ColumnHeader("Model"),
                cell: ({ row }) => (
                    <Cell
                        link={"/settings/community/community-template/slug"}
                        slug={row.original.slug}
                    >
                        <PrimaryCellContent className="uppercase">
                            {row.original.modelName}
                        </PrimaryCellContent>
                    </Cell>
                )
            },
            {
                id: "modelCost",
                header: ColumnHeader("Model Cost"),
                cell: ({ row }) => <CommunityModelCostCell row={row.original} />
            },
            {
                id: "install-costs",
                header: ColumnHeader("Install Cost"),
                cell: ({ row }) => (
                    <InstallCostCell row={row.original} modal="installCost" />
                )
            },
            ..._FilterColumn("_q", "_builderId", "_projectId"),

            {
                accessorKey: "actions",
                header: ColumnHeader(""),
                size: 15,
                maxSize: 15,
                enableSorting: false,
                cell: ({ row }) => (
                    <RowActionCell>
                        <RowActionMoreMenu>
                            <RowActionMenuItem
                                onClick={async () => {
                                    const _ = await _importModelCost(
                                        row.original.id,
                                        row.original.modelName,
                                        row.original.project.builderId,
                                        row.original.meta,
                                        row.original.project.builder.meta.tasks
                                    );
                                    if (!_) toast.error("No Import found");
                                    else
                                        toast.success(
                                            "Cost Import Successfully"
                                        );
                                }}
                            >
                                Import Model Cost
                            </RowActionMenuItem>
                            {/* <RowActionMenuItem>
                                Start Production
                            </RowActionMenuItem>
                            <RowActionMenuItem>
                                Submit Production
                            </RowActionMenuItem>
                            <RowActionMenuItem>
                                Cancel Production
                            </RowActionMenuItem> */}
                        </RowActionMoreMenu>
                    </RowActionCell>
                )
            }
        ], //.filter(Boolean) as any,
        [data, isPending]
    );
    return (
        <DataTable2
            searchParams={searchParams}
            columns={columns}
            pageInfo={pageInfo}
            data={data}
            filterableColumns={[BuilderFilter, ProjectsFilter]}
            searchableColumns={[
                {
                    id: "_q" as any,
                    title: ""
                }
            ]}

            //  deleteRowsAction={() => void deleteSelectedRows()}
        />
    );
}
