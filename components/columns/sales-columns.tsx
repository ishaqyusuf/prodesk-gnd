"use client";

import { ISalesOrder } from "@/types/sales";
import OrderFlag from "../sales/order-flag";
import Link from "next/link";
import { Fragment } from "react";
import { formatDate } from "@/lib/use-day";

export const OrderPriorityFlagColumn = (editable: Boolean = false) => ({
  // accessorKey: "flag",
  maxSize: 10,
  id: "flags",

  // header: ({ column }) => (
  //   <DataTableColumnHeader className="w-4" column={column} title="" />
  // ),
  cell: ({ row }) => {
    return (
      <div className="w-4">
        <OrderFlag order={row.original} />
      </div>
    );
  },
  // filterFn
});
export function OrderIdCell(
  order: ISalesOrder,
  link: string | undefined = undefined
) {
  link = link?.replace("slug", order.slug);
  const Node = link ? Link : Fragment;
  return (
    <div>
      <Node href={link || ""} className="hover:underline">
        <p className="whitespace-nowrap font-medium uppercase">
          {order.orderId}
        </p>

        <span className="text-muted-foreground">
          {formatDate(order.createdAt)}
        </span>
      </Node>
    </div>
  );
}
