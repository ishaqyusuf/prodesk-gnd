"use client";

import { TableShellProps } from "@/types/IDataTable";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import { CheckColumn } from "../columns/base-columns";

export default function OrdersTableShell<T>({ data }: TableShellProps<T>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<any, unknown>[]>(
    () => [CheckColumn({ selectedRowIds, setSelectedRowIds, data })],
    [data, isPending]
  );
}
