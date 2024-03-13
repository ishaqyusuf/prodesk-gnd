"use client";

import { IAddressBook, ISalesOrder } from "@/types/sales";
import OrderFlag from "../sales/order-flag";
import Link from "next/link";
import { Fragment, useEffect, useState, useTransition } from "react";
import { formatDate } from "@/lib/use-day";
import { Customers } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "../../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { priorities } from "@/lib/sales/order-priority";
import { FlagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateOrderPriorityActon } from "@/app/(v1)/_actions/sales/sales";
import { toast } from "sonner";
import { Icons } from "../icons";
import { Progress } from "../../ui/progress";
import {
    Cell,
    DateCellContent,
    PrimaryCellContent,
    SecondaryCellContent,
} from "./base-columns";
import { toFixed } from "@/lib/use-number";
import { Progressor, getProgress } from "@/lib/status";
import ProgressStatus from "../progress-status";
import LinkableNode from "../link-node";
import { ICustomer } from "@/types/customers";
import dayjs from "dayjs";
import StatusBadge from "../status-badge";

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
                            <DropdownMenuItem
                                key={_}
                                onClick={() => Update(p.title)}
                            >
                                <FlagIcon
                                    className={`mr-2 h-4 w-4 text-${p.color}-500`}
                                />
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
    return (
        <div>
            <LinkableNode
                href={link || ""}
                className={cn(link && "hover:underline")}
            >
                <p className="whitespace-nowrap font-medium uppercase">
                    {order.orderId}
                </p>

                <span className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                    <span>
                        {order.isDyke && (
                            <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                                v2
                            </span>
                        )}
                    </span>
                </span>
            </LinkableNode>
        </div>
    );
}
export function SalesCustomerCell({ order }: { order: ISalesOrder }) {
    let address: IAddressBook = (order?.shippingAddress ||
        order?.billingAddress) as any;
    if (!order?.shippingAddress) return <></>;
    const link = "/sales/customer/" + order.customer?.id;
    return (
        <div className="w-full">
            <LinkableNode href={link} className={cn("hover:underline")}>
                <div className="font-medium uppercase">
                    {order?.customer?.businessName || order?.customer?.name}
                </div>
                <span className="text-muted-foreground">
                    {address?.phoneNo}
                </span>
            </LinkableNode>
        </div>
    );
}
export function OrderCustomerCell(
    customer: ICustomer | undefined,
    link: string | undefined = undefined,
    phone = null
) {
    if (!customer) return <></>;
    link = link?.replace("slug", customer.id?.toString());
    const Node = link ? Link : Fragment;
    return (
        <div className="w-full">
            <LinkableNode href={link || ""}>
                <div className="font-medium uppercase">{customer?.name}</div>
                <span className="text-muted-foreground">
                    {phone || customer?.phoneNo}
                </span>
                {/* <p className="text-muted-foreground line-clamp-2">{address1}</p> */}
            </LinkableNode>
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
            <LinkableNode
                href={link || ""}
                className={cn(link && "hover:underline")}
            >
                <span className="text-muted-foreground line-clamp-2">
                    {customer?.address1}
                </span>
            </LinkableNode>
        </div>
    );
}
interface OrderInvoiceCellProps {
    order: ISalesOrder | undefined;
    isEstimate?: Boolean;
    link?: string | undefined;
    className?: string;
}
export function OrderInvoiceCell({
    order,
    isEstimate,
    link,
    className,
}: OrderInvoiceCellProps) {
    return (
        <div className={cn(className)}>
            <div className="font-medium uppercase">
                ${toFixed(order?.grandTotal)}
            </div>
            {!isEstimate && (
                <span
                    className={cn(
                        (order?.amountDue || 0) > 0
                            ? " text-red-400"
                            : "text-muted-foreground"
                    )}
                >
                    (${toFixed(order?.amountDue) || "0.00"})
                </span>
            )}
        </div>
    );
}
export function OrderStatus({
    order,
    delivery = false,
}: {
    order: ISalesOrder | undefined;
    delivery?;
}) {
    let status: any = order?.prodStatus;
    if (["In Transit", "Return", "Delivered"].includes(order?.status as any))
        status = order?.status;
    if (!status) status = delivery ? "-" : order?.prodId ? "Prod Queued" : "";
    if (status == "Completed" && delivery) status = "Ready";
    const color = getBadgeColor(order?.prodStatus || "");
    return (
        <div className="min-w-16">
            <Badge
                variant={"secondary"}
                className={`h-5 px-1 whitespace-nowrap  text-xs text-slate-100 ${color}`}
            >
                {/* {order?.prodStatus || "-"} */}
                {status || "no status"}
            </Badge>
            {delivery && order?.deliveredAt && (
                <DateCellContent>{order.deliveredAt}</DateCellContent>
            )}
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
            <p className="font-medium whitespace-nowrap">
                {order.producer?.name}
            </p>
            <p className="text-muted-foreground">
                {formatDate(order.prodDueDate)}
            </p>
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
export function DeliveryStatus({ order }: { order: ISalesOrder }) {}
export function ProdStatusCell({ order }: { order: ISalesOrder }) {
    const [progress, setProgress] = useState<Progressor>({} as any);
    const [isLate, setIsLate] = useState<boolean>(false);
    useEffect(() => {
        setProgress(getProgress(order.builtQty, order.prodQty));
        setIsLate(
            order.prodDueDate &&
                dayjs(order.prodDueDate).diff(dayjs(), "days") < 0 &&
                order.prodStatus != "Completed"
                ? true
                : false
        );
    }, [order]);
    if (order.inventoryStatus == "Pending Items")
        return <StatusBadge status={order.inventoryStatus} />;
    if (progress.score > 0)
        return (
            <ProgressStatus
                score={order.builtQty}
                total={order.prodQty}
                status={isLate ? "Late" : order.prodStatus}
            />
        );
    return (
        <StatusBadge
            status={
                isLate
                    ? "Late"
                    : order.prodStatus || (order.prodId ? "Queued" : "Unknown")
            }
        />
    );
}
