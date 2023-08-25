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
  IHome,
  IInvoice,
  IProject,
  IHomeTask,
  ExtendedHomeTasks,
} from "@/types/community";
import { BuilderFilter } from "../filters/builder-filter";
import {
  HomeInstallationStatus,
  HomeProductionStatus,
} from "../columns/community-columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  ActionButton,
  DeleteRowAction,
  RowActionCell,
  RowActionMenuItem,
  RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import Money from "../money";
import { sum } from "@/lib/utils";
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { ProjectsFilter } from "../filters/projects-filter";
import StatusBadge from "../status-badge";

export default function CommunityProductionsTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ExtendedHomeTasks>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ExtendedHomeTasks, unknown>[]>(
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
      {
        accessorKey: "jobs",
        header: ColumnHeader("Job"),
        cell: ({ row }) => (
          <Cell
          // link="/community/unit/slug" slug={row.original?.slug}
          >
            <PrimaryCellContent>{row.original.taskName}</PrimaryCellContent>

            <SecondaryCellContent>
              {row.original?.project?.title} {row.original?.home?.modelName}{" "}
              {row.original?.home?.lot}/{row.original?.home?.block}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "prod",
        header: ColumnHeader("Due Date"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              <DateCellContent>
                {row.original.productionDueDate}
              </DateCellContent>
            </PrimaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => (
          <Cell>
            <StatusBadge status={row.original.productionStatus || "unknown"} />
            <DateCellContent>{row.original.producedAt}</DateCellContent>
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
        cell: ({ row }) => (
          <RowActionCell>
            <RowActionMoreMenu>
              <RowActionMenuItem>Start Production</RowActionMenuItem>
              <RowActionMenuItem>Submit Production</RowActionMenuItem>
              <RowActionMenuItem>Cancel Production</RowActionMenuItem>
            </RowActionMoreMenu>
          </RowActionCell>
        ),
      },
    ], //.filter(Boolean) as any,
    [data, isPending]
  );
  return (
    <>
      <DataTable2
        columns={columns}
        pageInfo={pageInfo}
        data={data}
        SelectionAction={HomesSelectionAction}
        filterableColumns={[ProjectsFilter]}
        searchableColumns={[
          {
            id: "_q" as any,
            title: "search invoice",
          },
        ]}
        dateFilterColumns={[
          {
            id: "_date" as any,
            title: "Date",
          },
        ]}
        //  deleteRowsAction={() => void deleteSelectedRows()}
      />
    </>
  );
}
