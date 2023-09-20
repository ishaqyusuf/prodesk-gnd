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

import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";
import { HomeProductionStatus } from "../columns/community-columns";
import { IProject } from "@/types/community";
import Money from "../money";
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import AddonCell from "../community/addon-cell";

export default function ProjectsTableShell<T>({
  data,
  pageInfo,
  searchParams,
}: TableShellProps<IProject>) {
  const [isPending, startTransition] = useTransition();
  console.log(searchParams);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IProject, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("Ref/Date"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.refNo}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
      },
      {
        id: "title",
        header: ColumnHeader("Project"),
        cell: ({ row }) => (
          <Cell link={`/community/project/slug`} slug={row.original.slug}>
            <PrimaryCellContent>{row.original.title}</PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.builder?.name}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "supervisor",
        header: ColumnHeader("Supervisor"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              {row.original.meta?.supervisor?.name}
            </PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.meta?.supervisor?.email}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "homes",
        header: ColumnHeader("Units"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              {row.original._count?.homes}
            </PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "addons",
        header: ColumnHeader("Addons"),
        cell: ({ row }) => <AddonCell project={row.original} />,
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
      searchParams={searchParams}
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[BuilderFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
