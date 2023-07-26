"use client";
import { columnHeader } from "@/app/(auth)/sales/orders/components/columns";
import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Fragment } from "react";

export const myProductionColuns: ColumnDef<ISalesOrder>[] = [];

interface ProdOrderColumnProps {
  accessorKey?;
  header?;
  link?(row: ISalesOrder);
}
export function ProdOrderColumn({
  accessorKey = "orderId",
  header = "Order",
  link,
}: ProdOrderColumnProps) {
  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const _link = link ? link(row.original) : null;
      const Node = _link ? Link : Fragment;
      return (
        <Node href={_link}>
          <p className="font-semibold">{row.original.customer?.name}</p>
          <p>{row.original.orderId}</p>
        </Node>
      );
    },
  };
}
