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
} from "../columns/base-columns";

import { OrderRowAction, PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { IHome } from "@/types/community";
import { BuilderFilter } from "../filters/builder-filter";
import { HomeProductionStatus } from "../columns/community-columns";

export default function HomesTableShell<T>({
  data,
  pageInfo,
  projectView,
}: TableShellProps<IHome> & {
  projectView: Boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IHome, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("ID"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.id}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
      },
      ...(!projectView
        ? ([
            {
              header: ColumnHeader("Project"),
              id: "title",
              cell: ({ row }) => (
                <Cell
                  link="/community/project/slug"
                  slug={row.original.project}
                >
                  <PrimaryCellContent>
                    {row.original?.project?.title}
                  </PrimaryCellContent>

                  <SecondaryCellContent>
                    {row.original?.project?.builder?.name}
                  </SecondaryCellContent>
                </Cell>
              ),
            },
          ] as ColumnDef<IHome, unknown>[])
        : []),
      {
        accessorKey: "model",
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original?.modelName}
            </SecondaryCellContent>
          </Cell>
        ),
        header: ColumnHeader("Model No"),
      },
      {
        accessorKey: "lot",
        header: ColumnHeader("Lot/Block"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              {row.original.lot}
              {"/"}
              {row.original.block}
            </PrimaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "prod",
        header: ColumnHeader("Production"),
        cell: ({ row }) => (
          <Cell>
            <HomeProductionStatus home={row.original} />
          </Cell>
        ),
      },
      {
        accessorKey: "_status",
        enableHiding: false,
      },
      {
        accessorKey: "_q",
        enableHiding: false,
      },
      {
        accessorKey: "_builderId",
        enableHiding: false,
      },
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        // cell: ({ row }) => <OrderRowAction row={row.original} />,
      },
    ], //.filter(Boolean) as any,
    [data, isPending]
  );
  return (
    <DataTable2
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[BuilderFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: projectView
            ? "project Name,model,lot/block"
            : "model, lot/block",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
