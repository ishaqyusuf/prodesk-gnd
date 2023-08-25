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

import { ExtendedHome, IInvoice, IProject } from "@/types/community";
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
  RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import Money from "../money";
import { sum } from "@/lib/utils";
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { ProjectsFilter } from "../filters/projects-filter";

export default function CommunityInvoiceTableShell<T>({
  data,
  pageInfo,
  project,
}: TableShellProps<IInvoice> & {
  project?: IProject;
}) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IInvoice, unknown>[]>(
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
      ...(!project
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
              ),
            },
          ] as ColumnDef<IInvoice, unknown>[])
        : []),
      {
        accessorKey: "lotBlock",
        header: ColumnHeader("Lot/Block"),
        cell: ({ row }) => (
          <Cell
          // link="/community/unit/slug" slug={row.original?.slug}
          >
            <PrimaryCellContent>
              {row.original.lot}
              {"/"}
              {row.original.block}
            </PrimaryCellContent>
            <SecondaryCellContent>
              {row.original?.home?.modelName}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "prod",
        header: ColumnHeader("Production"),
        cell: ({ row }) => (
          <Cell>
            <HomeProductionStatus home={row.original.home} />
          </Cell>
        ),
      },
      {
        accessorKey: "inst",
        header: ColumnHeader("Installation"),
        cell: ({ row }) => (
          <Cell>
            <HomeInstallationStatus home={row.original.home} />
          </Cell>
        ),
      },
      {
        accessorKey: "inst",
        header: ColumnHeader("Invoice"),
        cell: ({ row }) => {
          const paid = sum(row?.original?.home?.tasks, "amountPaid");
          const due = sum(row?.original?.home?.tasks, "amountDue");
          return (
            <Cell>
              <PrimaryCellContent className="">
                <Money value={paid} />
              </PrimaryCellContent>
              <SecondaryCellContent className="text-red-400">
                <Money value={due} />
              </SecondaryCellContent>
            </Cell>
          );
        },
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
              <ActionButton
                Icon={Icons.edit}
                onClick={() => openModal("editInvoice", row.original)}
              />
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
