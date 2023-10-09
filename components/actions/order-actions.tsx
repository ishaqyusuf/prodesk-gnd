"use client";

import { IOrderPrintMode, IOrderType, ISalesOrder } from "@/types/sales";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
    Banknote,
    BookOpen,
    Check,
    Construction,
    Copy,
    FileText,
    FlagIcon,
    Info,
    ListOrderedIcon,
    MessageSquarePlus,
    MoreHorizontal,
    Package,
    Pen,
    Printer,
    ShoppingBag,
    Trash,
    View,
    X
} from "lucide-react";
import Link from "next/link";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    copyOrderAction,
    deleteOrderAction,
    moveSales
} from "@/app/_actions/sales/sales";
import { toast } from "sonner";
import { dispatchSlice } from "@/store/slicers";
import { useBool } from "@/lib/use-loader";
import { Icons } from "../icons";
import { store } from "@/store";
import {
    adminCompleteProductionAction,
    cancelProductionAssignmentAction,
    markProductionIncompleteAction
} from "@/app/_actions/sales/sales-production";
import { openModal } from "@/lib/modal";
import { EmailModalProps } from "@/types/email";
import {
    DeleteRowAction,
    RowActionMenuItem
} from "../data-table/data-table-row-actions";
import AuthGuard from "../auth-guard";
import { printSalesPdf } from "@/app/_actions/sales/save-pdf";
import { env } from "@/env.mjs";

export interface IOrderRowProps {
    row: ISalesOrder;
    viewMode?: Boolean;
    estimate?: Boolean;
    print?(mode: IOrderType | "production");
    myProd?: Boolean;
}
export function OrderRowAction(props: IOrderRowProps) {
    const { row, viewMode, estimate } = props;
    const _linkDir = `/sales/${row.type}/${row.slug}`;
    const router = useRouter();
    async function moveEstimateToOrder() {
        await moveSales(row.id, "order");
        toast.message("Estimate moved to order");
        router.push(`/sales/order/${row.orderId}`);
    }
    async function moveToEstimate() {
        await moveSales(row.id, "estimate");
        toast.message("Order moved to estimate");
        router.push(`/sales/estimate/${row.orderId}`);
    }
    return (
        <AuthGuard permissions={["editOrders"]} className="">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[185px]">
                    <Link href={_linkDir}>
                        <DropdownMenuItem>
                            <View className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            View
                        </DropdownMenuItem>
                    </Link>
                    <Link href={`${_linkDir}/form`}>
                        <DropdownMenuItem>
                            <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Edit
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                        onClick={() => {
                            console.log(row);
                            openModal<EmailModalProps>("email", {
                                type: "sales",
                                parentId: row.id,
                                toName: row.customer?.name,
                                toEmail: row.customer?.email,
                                from: "GND Millwork<sales@gndprodesk.com>",
                                data: row
                            });
                        }}
                    >
                        <MessageSquarePlus className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Email
                    </DropdownMenuItem>
                    {!estimate ? (
                        <>
                            <ProductionAction row={row} />
                            <RowActionMenuItem
                                Icon={ShoppingBag}
                                onClick={moveToEstimate}
                            >
                                Move to Estimate
                            </RowActionMenuItem>
                        </>
                    ) : (
                        <>
                            <RowActionMenuItem
                                Icon={ShoppingBag}
                                onClick={moveEstimateToOrder}
                            >
                                Move to Order
                            </RowActionMenuItem>
                        </>
                    )}
                    <CopyOrderMenuAction row={row} />
                    <PrintOrderMenuAction estimate={estimate} row={row} />
                    <PrintOrderMenuAction
                        mockup
                        estimate={estimate}
                        row={row}
                    />
                    <PrintOrderMenuAction pdf estimate={estimate} row={row} />
                    <PrintOrderMenuAction link estimate={estimate} row={row} />
                    {/* <PrintOrderMenuAction pdf estimate={estimate} row={row} /> */}
                    {/* <PrintOrderMenuAction pdf estimate={estimate} row={row} /> */}

                    <DeleteRowAction
                        menu
                        row={row}
                        action={deleteOrderAction}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </AuthGuard>
    );
}

export const PrintOrderMenuAction = typedMemo(
    (
        props: IOrderRowProps & {
            ids?: number[];
            pdf?: Boolean;
            mockup?: Boolean;
            link?: Boolean;
        }
    ) => {
        async function _print(mode: IOrderPrintMode) {
            const ids = props.ids || [props.row.id];

            if (props.link) {
                const link = document.createElement("a");
                const prod = env.NEXT_PUBLIC_NODE_ENV == "production";
                let base = prod
                    ? `https://gnd-prodesk.vercel.app`
                    : "http://localhost:3001";
                link.href = `${base}/print-sales?id=${ids}&mode=${mode}&prints=true`;
                link.target = "_blank";
                // link.download = "file.pdf";
                // document.body.appendChild(link);
                link.click();
            } else
                dispatchSlice("printOrders", {
                    mode,
                    pdf: props.pdf,
                    mockup: props.mockup,
                    ids,
                    isClient: !["production", "packing list"].includes(mode),
                    showInvoice: ["order", "quote", "invoice"].includes(mode),
                    packingList: mode == "packing list",
                    isProd: mode == "production"
                });
        }
        function PrintOptions() {
            return (
                <>
                    <DropdownMenuItem
                        onClick={() => {
                            _print("quote");
                        }}
                    >
                        <Banknote className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Estimates
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            _print("order");
                        }}
                    >
                        <ShoppingBag className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Order
                    </DropdownMenuItem>
                    {!props.mockup && (
                        <>
                            <DropdownMenuItem
                                onClick={() => {
                                    _print("packing list");
                                }}
                            >
                                <Package className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Packing List
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    _print("production");
                                }}
                            >
                                <Construction className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Production
                            </DropdownMenuItem>
                        </>
                    )}
                </>
            );
        }
        if (props.ids) {
            return <PrintOptions />;
        }
        return props.myProd || props.estimate ? (
            <DropdownMenuItem
                onClick={() => {
                    if (props.estimate) _print("quote");
                    else _print("production");
                }}
            >
                <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Print {props.mockup && " Mockup"} {props.link && "(v2)"}
            </DropdownMenuItem>
        ) : (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    {!props.pdf ? (
                        <>
                            <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Print {props.mockup && " Mockup"}{" "}
                            {props.link && "(v2)"}
                        </>
                    ) : (
                        <>
                            <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                            Pdf
                        </>
                    )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    <PrintOptions />
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    }
);

export const CopyOrderMenuAction = typedMemo((props: IOrderRowProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const _copyOrder = useCallback(
        async (as: IOrderType = "order") => {
            startTransition(async () => {
                const _ = await copyOrderAction({
                    orderId: props.row.orderId,
                    as
                });
                toast.success(`${as} copied successfully`, {
                    action: {
                        label: "Open",
                        onClick: () =>
                            router.push(`/sales/${as}/${_.orderId}/form`)
                    }
                });
            });
        },
        [props.row]
    );
    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Copy As
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuItem
                    onClick={() => {
                        _copyOrder("estimate");
                    }}
                >
                    <Banknote className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Estimates
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        _copyOrder("order");
                    }}
                >
                    <ShoppingBag className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Order
                </DropdownMenuItem>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
});
export const ProductionAction = typedMemo(({ row }: IOrderRowProps) => {
    const assignProduction = useCallback(() => {
        const { id, orderId, prodDueDate, prodId } = row;
        openModal("assignProduction", { id, orderId, prodDueDate, prodId });
        // store.dispatch(
        //   updateSlice({
        //     key: "assignProduction",
        //     data: { id, orderId, prodDueDate, prodId },
        //   })
        // );
    }, [row]);
    const router = useRouter();

    async function _clearAssignment() {
        await cancelProductionAssignmentAction(row.id);
        __refresh("Production Assignment Cancelled");
    }
    function __refresh(_toast: string = "") {
        router.refresh();
        if (_toast) toast.success(_toast);
    }
    async function markIncomplete() {
        await markProductionIncompleteAction(row.id);
        __refresh("Production Marked as Incomplete");
    }
    async function completeProduction() {
        await adminCompleteProductionAction(row.id);
        __refresh("Production Completed");
    }
    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <ListOrderedIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Production
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuItem className="" asChild>
                    <Link
                        href={`/sales/production/${row.orderId}`}
                        className="flex w-full"
                    >
                        <BookOpen className={`mr-2 h-4 w-4`} />
                        <span>Open</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={assignProduction}>
                    <FlagIcon className={`mr-2 h-4 w-4`} />
                    <span>{row.prodId ? "Update Assignment" : "Assign"}</span>
                </DropdownMenuItem>
                {row.prodStatus == "Completed" ? (
                    <>
                        <DropdownMenuItem onClick={markIncomplete}>
                            <FlagIcon className={`mr-2 h-4 w-4`} />
                            <span>Incomplete</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem onClick={_clearAssignment}>
                            <X className={`mr-2 h-4 w-4`} />
                            <span>Clear Assign</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={completeProduction}>
                            <Check className={`mr-2 h-4 w-4`} />
                            <span>Mark as Completed</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
});
