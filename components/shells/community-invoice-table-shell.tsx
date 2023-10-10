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

import { ExtendedHome, IHome } from "@/types/community";
import { BuilderFilter } from "../filters/builder-filter";
import {
    HomeInstallationStatus,
    HomeInvoiceColumn,
    HomeProductionStatus,
    HomeStatus
} from "../columns/community-columns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Printer, View } from "lucide-react";
import Link from "next/link";
import { deleteHome } from "@/app/_actions/community/home";
import { dispatchSlice } from "@/store/slicers";
import { HomesSelectionAction } from "../community/homes-selection-action";
import HomePrinter from "../print/home/home-printer";
import { deepCopy } from "@/lib/deep-copy";
import {
    DeleteRowAction,
    EditRowAction
} from "../data-table/data-table-row-actions";
import { ProjectsFilter } from "../filters/projects-filter";
import { labelValue } from "@/lib/utils";
import { openModal } from "@/lib/modal";

export default function HomesTableShell<T>({
    data,
    pageInfo,
    searchParams,
    projectView
}: TableShellProps<ExtendedHome> & {
    projectView: Boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
    const columns = useMemo<ColumnDef<ExtendedHome, unknown>[]>(
        () => [
            CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
            {
                maxSize: 10,
                id: "id",
                header: ColumnHeader("ID"),
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
            ...(!projectView
                ? ([
                      {
                          header: ColumnHeader("Project"),
                          id: "title",
                          cell: ({ row }) => (
                              <Cell
                                  link="/community/project/slug"
                                  slug={row.original.project?.slug}
                              >
                                  <PrimaryCellContent>
                                      {row.original?.project?.title}
                                  </PrimaryCellContent>

                                  <SecondaryCellContent>
                                      {row.original?.project?.builder?.name}
                                  </SecondaryCellContent>
                              </Cell>
                          )
                      }
                  ] as ColumnDef<ExtendedHome, unknown>[])
                : []),
            {
                accessorKey: "unit",
                header: ColumnHeader("Unit"),
                cell: ({ row }) => (
                    <Cell link="/community/unit/slug" slug={row.original?.slug}>
                        <PrimaryCellContent>
                            {row.original.lot}
                            {"/"}
                            {row.original.block}
                        </PrimaryCellContent>
                        <SecondaryCellContent>
                            {row.original?.modelName}
                        </SecondaryCellContent>
                    </Cell>
                )
            },
            // {
            //   accessorKey: "model",
            //   cell: ({ row }) => (
            //     <Cell>
            //       <SecondaryCellContent>
            //         {row.original?.modelName}
            //       </SecondaryCellContent>
            //     </Cell>
            //   ),
            //   header: ColumnHeader("Model No"),
            // },
            // {
            //   accessorKey: "lot",
            //   header: ColumnHeader("Lot/Block"),
            //   cell: ({ row }) => (
            //     <Cell>
            //       <PrimaryCellContent>
            //         {row.original.lot}
            //         {"/"}
            //         {row.original.block}
            //       </PrimaryCellContent>
            //     </Cell>
            //   ),
            // },

            {
                accessorKey: "status",
                header: ColumnHeader("Status"),
                cell: ({ row }) => (
                    <Cell>
                        <HomeStatus home={row.original} />
                    </Cell>
                )
            },
            {
                accessorKey: "invoice",
                header: ColumnHeader("Invoice"),
                cell: ({ row }) => <HomeInvoiceColumn home={row.original} />
            },
            ..._FilterColumn(
                "_status",
                "_q",
                "_builderId",
                "_projectId"
                // "_installation",
                // "_production"
            ),
            {
                accessorKey: "actions",
                header: ColumnHeader(""),
                size: 15,
                maxSize: 15,
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="">
                        <EditRowAction
                            onClick={e => {
                                openModal("editInvoice", row.original);
                            }}
                        />
                    </div>
                )
            }
        ], //.filter(Boolean) as any,
        [data, isPending]
    );
    return (
        <>
            <HomePrinter />
            <DataTable2
                searchParams={searchParams}
                columns={columns}
                pageInfo={pageInfo}
                data={data}
                SelectionAction={HomesSelectionAction}
                filterableColumns={[
                    BuilderFilter,
                    ProjectsFilter,
                    {
                        id: "_production",
                        title: "Production",
                        single: true,
                        options: [
                            labelValue("Completed", "completed"),
                            labelValue("Not In Production", "idle"),
                            labelValue("Started", "started"),
                            labelValue("Queued", "queued")
                        ]
                    },
                    {
                        id: "_installation",
                        title: "Installation",
                        single: true,
                        options: [
                            labelValue("Submitted", "submitted"),
                            labelValue("No Submission", "no-submission")
                        ]
                    }
                ]}
                searchableColumns={[
                    {
                        id: "_q" as any,
                        title: projectView
                            ? "project Name,model,lot/block"
                            : "model, lot/block"
                    }
                ]}

                //  deleteRowsAction={() => void deleteSelectedRows()}
            />
        </>
    );
}
