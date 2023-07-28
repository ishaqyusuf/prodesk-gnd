"use client";

import { ICustomer, ISalesOrder } from "@/types/sales";
import OrderFlag from "../sales/order-flag";
import Link from "next/link";
import { Fragment } from "react";
import { formatDate } from "@/lib/use-day";
import { Customers } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "../ui/badge";

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
      <Node href={link || ""} className={cn(link && "hover:underline")}>
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
export function OrderCustomerCell(
  customer: Customers | undefined,
  link: string | undefined = undefined
) {
  if (!customer) return <></>;
  link = link?.replace("slug", customer.id?.toString());
  const Node = link ? Link : Fragment;
  return (
    <div className="w-full">
      <Node href={link || ""} className={cn(link && "hover:underline")}>
        <div className="font-medium uppercase">{customer?.name}</div>
        <span className="text-muted-foreground">{customer?.phoneNo}</span>
      </Node>
    </div>
  );
}
export function OrderInvoiceCell(
  order: ISalesOrder | undefined,
  isEstimate = false,
  link: string | undefined = undefined
) {
  if (!order) return <></>;
  link = link?.replace("slug", order.id?.toString());
  const Node = link ? Link : Fragment;
  return (
    <div className="w-full">
      <Node href={link || ""} className={cn(link && "hover:underline")}>
        <div className="font-medium uppercase">${order.grandTotal}</div>
        {!isEstimate && (
          <span className="text-muted-foreground">
            ${order.amountDue || "0.00"}
          </span>
        )}
      </Node>
    </div>
  );
}
export function OrderProductionCell(
  order: ISalesOrder | undefined,
  link: string | undefined = undefined
) {
  if (!order) return <></>;
  const color = getBadgeColor(order.prodStatus);
  return (
    <div className="w-16">
      <p className="font-medium whitespace-nowrap">{order.producer?.name}</p>
      <Badge
        variant={"secondary"}
        className={`h-5 px-1   text-xs text-slate-100 ${color}`}
      >
        {order.prodStatus || "-"}
      </Badge>
    </div>
  );
}
