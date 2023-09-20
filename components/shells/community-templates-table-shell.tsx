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

import { ICommunityTemplate, IHomeTemplate } from "@/types/community";

export default function CommunityTemplateTableShell<T>({
  data,
  pageInfo,
  searchParams,
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
            <PrimaryCellContent>{row.original.id}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
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
        ),
      },
      {
        id: "model",
        header: ColumnHeader("Model"),
        cell: ({ row }) => (
          <Cell
            link={"/settings/community/community-template/slug"}
            slug={row.original.slug}
          >
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.modelName}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "_q",
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
