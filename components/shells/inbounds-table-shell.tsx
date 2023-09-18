"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  DateCellContent,
} from "../columns/base-columns";
import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";
import {
  DeleteRowAction,
  RowActionCell,
  RowActionMenuItem,
  RowActionMoreMenu,
} from "../data-table/data-table-row-actions";

import { EmployeeProfile } from "@prisma/client";
import { deleteEmployeeProfile } from "@/app/_actions/hrm/employee-profiles";
import { IInboundOrder } from "@/types/sales-inbound";
import StatusBadge from "../status-badge";
import { Badge } from "../ui/badge";
import { InboundStatus } from "@/lib/status";
import { updateInboundStatusAction } from "@/app/_actions/sales-inbound/update-inbound-status";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InboundsTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IInboundOrder>) {
  const [isPending, startTransition] = useTransition();
  // console.log(data);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const route = useRouter();
  async function updateStatus(slug, status) {
    await updateInboundStatusAction(slug, status);
    toast.success("Updated");
    route.refresh();
  }
  const columns = useMemo<ColumnDef<IInboundOrder, unknown>[]>(
    () => [
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("#/Date"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.orderId}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
      },
      {
        id: "putaway",
        header: ColumnHeader("Putaway"),
        cell: ({ row }) => (
          <Cell
            link={`/sales/inbounds/putaway?orderId=${row.original.orderId}`}
          >
            <Badge>
              {row.original.inboundItems.filter((i) => i?.putawayAt)?.length}
              {"/"}
              {row.original.inboundItems.length}
            </Badge>
          </Cell>
        ),
      },
      {
        id: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => (
          <Cell>
            <StatusBadge>{row.original.status}</StatusBadge>
          </Cell>
        ),
      },

      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            <DeleteRowAction
              row={row.original}
              action={deleteEmployeeProfile}
            />
            <RowActionMoreMenu>
              <RowActionMenuItem
                SubMenu={
                  <>
                    {InboundStatus.map((status) => (
                      <RowActionMenuItem
                        onClick={() => updateStatus(row.original.slug, status)}
                        key={status}
                      >
                        {status}
                      </RowActionMenuItem>
                    ))}
                  </>
                }
              >
                Status
              </RowActionMenuItem>
            </RowActionMoreMenu>
          </RowActionCell>
        ),
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
          title: "",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
