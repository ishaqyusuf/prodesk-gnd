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
    HomeProductionStatus
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
import { DeleteRowAction } from "../data-table/data-table-row-actions";
import { ProjectsFilter } from "../filters/projects-filter";
import { labelValue } from "@/lib/utils";
import { Icons } from "../icons";
import { getUnitTemplateLink } from "@/app/_actions/community/get-unit-template";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HomeSelectionAction } from "../community/home-selection-action";
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
    const route = useRouter();
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
                accessorKey: "lotBlock",
                header: ColumnHeader("Unit"),
                cell: ({ row }) => (
                    <Cell
                        className={"hover:underline cursor-pointer"}
                        onClick={async e => {
                            const edit = await getUnitTemplateLink(
                                row.original.projectId,
                                row.original.homeTemplateId,
                                row.original.modelName
                            );
                            if (edit) route.push(edit);
                        }}
                        // xlink="/community/unit/slug"
                        slug={row.original?.slug}
                    >
                        <PrimaryCellContent>
                            {/* {row.original.lot}
                            {"/"}
                            {row.original.block} */}
                            {row.original.lotBlock}
                        </PrimaryCellContent>
                        <SecondaryCellContent className="uppercase">
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
                accessorKey: "prod",
                header: ColumnHeader("Production"),
                cell: ({ row }) => (
                    <Cell>
                        <HomeProductionStatus home={row.original} />
                    </Cell>
                )
            },
            {
                accessorKey: "inst",
                header: ColumnHeader("Installation"),
                cell: ({ row }) => (
                    <Cell
                        slug="jobs"
                        link={
                            row.original.jobs?.length > 0
                                ? `/slug?_homeId=${row.original.id}`
                                : null
                        }
                    >
                        <HomeInstallationStatus home={row.original} />
                    </Cell>
                )
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[185px]">
                            {/* <Link
                href={`/community/unit-model/${row.original.homeTemplateId}`}
              > */}

                            <DropdownMenuItem
                                onClick={async e => {
                                    const edit = await getUnitTemplateLink(
                                        row.original.projectId,
                                        row.original.homeTemplateId,
                                        row.original.modelName
                                    );
                                    if (edit) route.push(edit);
                                    else
                                        toast.error("Model Template Not Found");
                                }}
                            >
                                <Icons.edit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={e => {
                                    openModal("home", row.original);
                                }}
                            >
                                <Icons.edit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Edit Model
                            </DropdownMenuItem>
                            {/* </Link> */}
                            <DropdownMenuItem
                                onClick={() => {
                                    dispatchSlice("printHomes", {
                                        homes: [deepCopy(row.original)]
                                    });
                                }}
                            >
                                <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Print
                            </DropdownMenuItem>
                            <DeleteRowAction
                                menu
                                row={row.original}
                                action={deleteHome}
                                // action={async () => deleteOrderAction(row.id)}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                SelectionAction={HomeSelectionAction}
                filterableColumns={[
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
