"use client";

import { IAddressBook, ISalesOrder } from "@/types/sales";
import OrderFlag from "../sales/order-flag";
import Link from "next/link";
import { Fragment, useEffect, useState, useTransition } from "react";
import { formatDate } from "@/lib/use-day";
import { Customers } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { priorities } from "@/lib/sales/order-priority";
import { FlagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateOrderPriorityActon } from "@/app/_actions/sales/sales";
import { toast } from "sonner";
import { Icons } from "../icons";
import { Progress } from "../ui/progress";
import { Cell, PrimaryCellContent, SecondaryCellContent } from "./base-columns";
import { toFixed } from "@/lib/use-number";
import { Progressor, getProgress } from "@/lib/status";
import ProgressStatus from "../progress-status";

export const OrderPriorityFlagCell = (
  order: ISalesOrder,
  editable: Boolean = false
) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const Update = async (priority) => {
    startTransition(async () => {
      try {
        await updateOrderPriorityActon({
          orderId: order.orderId,
          priority,
        });
        toast.success("Priority updated!");
        router.refresh();
      } catch (error) {
        toast.error("Unable to complete");
      }
    });
  };
  return (
    <div className="w-4">
      {!editable ? (
        <OrderFlag order={order} />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isPending ? (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <button className="focus:outline-none">
                <OrderFlag order={order} />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[185px]">
            {priorities.map((p, _) => (
              <DropdownMenuItem key={_} onClick={() => Update(p.title)}>
                <FlagIcon className={`mr-2 h-4 w-4 text-${p.color}-500`} />
                {p.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
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
export function OrderMemoCell(
  customer: IAddressBook | undefined,
  link: string | undefined = undefined
) {
  if (!customer) return <></>;
  link = link?.replace("slug", customer.id?.toString());
  const Node = link ? Link : Fragment;
  return (
    <div className="w-full">
      <Node href={link || ""} className={cn(link && "hover:underline")}>
        <span className="text-muted-foreground line-clamp-1">
          {customer?.address1}
        </span>
      </Node>
    </div>
  );
}
interface OrderInvoiceCellProps {
  order: ISalesOrder | undefined;
  isEstimate?: Boolean;
  link?: string | undefined;
}
export function OrderInvoiceCell({
  order,
  isEstimate,
  link,
}: OrderInvoiceCellProps) {
  return (
    <div>
      <div className="font-medium uppercase">${toFixed(order?.grandTotal)}</div>
      {!isEstimate && (
        <span
          className={cn(
            (order?.amountDue || 0) > 0
              ? " text-red-400"
              : "text-muted-foreground"
          )}
        >
          ${toFixed(order?.amountDue) || "0.00"}
        </span>
      )}
    </div>
  );
}
export function OrderStatus(order: ISalesOrder | undefined) {
  const color = getBadgeColor(order?.prodStatus || "");
  let status = order?.prodStatus;
  if (!status && order?.prodId) status = "Queued";
  return (
    <div className="w-16">
      <Badge
        variant={"secondary"}
        className={`h-5 px-1 whitespace-nowrap  text-xs text-slate-100 ${color}`}
      >
        {/* {order?.prodStatus || "-"} */}
        {status || "no status"}
      </Badge>
    </div>
  );
}
export function OrderProductionStatusCell(
  order: ISalesOrder | undefined,
  link: string | undefined = undefined
) {
  if (!order) return <></>;
  return (
    <div className="w-16">
      <p className="font-medium whitespace-nowrap">{order.producer?.name}</p>
      <p className="text-muted-foreground">{formatDate(order.prodDueDate)}</p>
    </div>
  );
}

export function ProdOrderCell(
  order: ISalesOrder | undefined,
  link: string | undefined = undefined
) {
  return (
    <Cell row={order} link={link} slug={order?.orderId}>
      <PrimaryCellContent>{order?.customer?.name}</PrimaryCellContent>
      <SecondaryCellContent>{order?.orderId}</SecondaryCellContent>
    </Cell>
  );
}

export function ProdStatusCell({ order }: { order: ISalesOrder }) {
  const [progress, setProgress] = useState<Progressor>({} as any);
  useEffect(() => {
    setProgress(getProgress(order.builtQty, order.prodQty));
  }, [order]);
  return (
    <ProgressStatus
      score={order.builtQty}
      total={order.prodQty}
      status={order.prodStatus}
    />
  );
}
