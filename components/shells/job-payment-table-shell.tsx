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
import { openModal } from "@/lib/modal";
import { IJobPayment, IUser } from "@/types/hrm";
import { CheckCheck, Key, X } from "lucide-react";
import { approveJob, rejectJob } from "@/app/_actions/hrm-jobs/job-actions";
import Money from "../money";

export default function JobPaymentTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IJobPayment>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IJobPayment, unknown>[]>(
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
        id: "job",
        header: ColumnHeader("Paid To"),
        cell: ({ row }) => (
          <Cell
            className="cursor-pointer"
            onClick={() => openModal("jobOverview", row.original)}
          >
            <PrimaryCellContent>{row.original.user?.name}</PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.user?.username}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "user",
        header: ColumnHeader("Paid For"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original._count.jobs} Job(s)
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "charges",
        header: ColumnHeader("Discount"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              <Money value={row.original.charges} />
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "total",
        header: ColumnHeader("Amount Paid"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              <Money value={row.original?.amount} />
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "payer",
        header: ColumnHeader("Paid By"),
        cell: ({ row }) => {
          return (
            <Cell>
              <SecondaryCellContent>
                {row.original.payer?.name}
              </SecondaryCellContent>
              {row?.original?.payer?.roles?.[0]?.name}
            </Cell>
          );
        },
      },

      {
        accessorKey: "_q",
        enableHiding: false,
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
          title: "filter",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
