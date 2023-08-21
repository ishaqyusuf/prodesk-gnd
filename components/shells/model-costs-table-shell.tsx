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
import { ICostChart, IHomeTemplate } from "@/types/community";
import { openModal } from "@/lib/modal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Money from "../money";
import { cn } from "@/lib/utils";

export default function ModelCostTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IHomeTemplate>) {
  const [isPending, startTransition] = useTransition();
  console.log(data);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IHomeTemplate, unknown>[]>(
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
        id: "title",
        header: ColumnHeader("Model"),
        cell: ({ row }) => (
          <Cell
            link={"/settings/community/model-template/slug"}
            slug={row.original.slug}
          >
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.modelName}</PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.builder?.name}
            </SecondaryCellContent>
          </Cell>
        ),
      },

      {
        id: "units",
        header: ColumnHeader("Total Units"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              {row.original._count?.homes}
            </PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "units",
        header: ColumnHeader("Model Cost"),
        cell: ({ row }) => {
          const cost: ICostChart = row.original.costs?.find(
            (c) => c.current
          ) as any;

          let money = cost?.meta?.totalCost;
          return (
            <Cell
              className="cursor-pointer"
              onClick={() => openModal("modelCost", row.original)}
            >
              {!cost ? (
                <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">
                  Set Cost
                </Badge>
              ) : (
                <>
                  <PrimaryCellContent>
                    <Money value={money} />
                  </PrimaryCellContent>
                  <SecondaryCellContent>
                    {row?.original?.costs?.length} cost history
                  </SecondaryCellContent>
                </>
              )}
            </Cell>
          );
        },
      },
      {
        id: "units",
        header: ColumnHeader("Install Costs"),
        cell: ({ row }) => (
          <Cell
            className="cursor-pointer"
            onClick={() => openModal("installCost", row.original)}
          >
            <Badge
              className={cn(
                row.original.meta?.installCosts?.length > 0
                  ? "bg-green-200 text-green-700 hover:bg-green-200"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-200"
              )}
            >
              {row.original.meta?.installCosts?.length || 0} Costs
            </Badge>
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
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[BuilderFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "title, builder",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
