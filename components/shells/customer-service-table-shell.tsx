"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckColumn,
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  DateCellContent,
  SecondaryCellContent,
  StatusCell,
  _FilterColumn,
} from "../columns/base-columns";

import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";

import { WorkOrders } from "@prisma/client";
import { Badge } from "../ui/badge";
import {
  DeleteRowAction,
  EditRowAction,
  RowActionCell,
} from "../data-table/data-table-row-actions";
import WorkOrderTechCell, {
  WorkOrderStatusCell,
} from "../work-order/tech-cell";
import { IWorkOrder } from "@/types/customer-service";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticEmployees } from "@/app/_actions/hrm/get-employess";
import { labelValue } from "@/lib/utils";
import { TechEmployeeFilter } from "../filters/employee-filter";
import { openModal } from "@/lib/modal";
import { deleteCustomerService } from "@/app/_actions/customer-services/crud";

export default function CustomerServiceTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IWorkOrder>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  const techEmployees = useAppSelector((s) => s.slicers.staticTechEmployees);
  useEffect(() => {
    loadStaticList("staticTechEmployees", techEmployees, async () => {
      return await staticEmployees({
        role: "Punchout",
      });
    });
    console.log(data);
  }, []);
  const columns = useMemo<ColumnDef<IWorkOrder, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("Appointment"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              <DateCellContent>{row.original.scheduleDate}</DateCellContent>
            </PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.scheduleTime}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "title",
        header: ColumnHeader("Description"),
        cell: ({ row }) => (
          <Cell link={`/customer-service/slug`} slug={row.original.slug}>
            <PrimaryCellContent>
              {row.original.projectName}{" "}
              <Badge
                className="p-0.5 leading-none bg-accent
              text-primary hover:bg-accent  px-1 rounded-sm"
              >
                {row.original.lot || "-"}
                {"/"}
                {row.original.block ?? "-"}
              </Badge>
            </PrimaryCellContent>
            <SecondaryCellContent className="line-clamp-2">
              {row.original.description}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "tech",
        header: ColumnHeader("Tech"),
        cell: ({ row }) => (
          <WorkOrderTechCell workOrder={row.original}></WorkOrderTechCell>
        ),
      },
      {
        id: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => (
          <Cell>
            <WorkOrderStatusCell workOrder={row.original} />
          </Cell>
        ),
      },

      ..._FilterColumn("_q", "_show", "_userId"),

      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            <EditRowAction
              onClick={() => openModal("customerServices", row.original)}
            />
            <DeleteRowAction
              row={row.original}
              action={async (id) => {
                await deleteCustomerService(row.original.slug);
              }}
            />
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
      filterableColumns={[
        {
          id: "_show",
          title: "Show",
          single: true,
          options: [
            labelValue("Scheduled", "scheduled"),
            labelValue("Incomplete", "incomplete"),
            labelValue("Completed", "completed"),
          ],
        },
        TechEmployeeFilter,
      ]}
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
