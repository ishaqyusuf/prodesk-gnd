"use client";

import { IOrderPrintMode, IOrderType, ISalesOrder } from "@/types/sales";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Copy, FileText, Pen, Printer, View } from "lucide-react";
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
    MenuItem,
    RowActionMenuItem,
    RowActionMoreMenu
} from "../data-table/data-table-row-actions";
import AuthGuard from "../auth-guard";
import { printSalesPdf } from "@/app/_actions/sales/save-pdf";
import { env } from "@/env.mjs";
import { sales } from "@/lib/sales/sales-helper";

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
            <RowActionMoreMenu>
                <MenuItem Icon={View} link={_linkDir}>
                    View
                </MenuItem>
                <MenuItem Icon={Pen} link={`${_linkDir}/form`}>
                    Edit
                </MenuItem>
                <MenuItem
                    Icon={Icons.Merge}
                    onClick={() => {
                        openModal("backOrder", row);
                    }}
                >
                    Back Order
                </MenuItem>
                {!estimate ? (
                    <>
                        <ProductionAction row={row} />
                        <MenuItem
                            Icon={Icons.estimates}
                            onClick={moveToEstimate}
                        >
                            Move to Estimate
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem
                            Icon={Icons.orders}
                            onClick={moveEstimateToOrder}
                        >
                            Move to Order
                        </MenuItem>
                    </>
                )}
                <CopyOrderMenuAction row={row} />
                <PrintOrderMenuAction link estimate={estimate} row={row} />
                <PrintOrderMenuAction
                    mockup
                    link
                    estimate={estimate}
                    row={row}
                />
                <PrintOrderMenuAction pdf estimate={estimate} row={row} />

                <DeleteRowAction menu row={row} action={deleteOrderAction} />
            </RowActionMoreMenu>
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
                    : "http://localhost:3000";
                link.href = `${base}/print-sales?id=${ids}&mode=${mode}&prints=true&mockup=${props.mockup}`;
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
                    <MenuItem
                        Icon={Icons.estimates}
                        onClick={() => {
                            _print("quote");
                        }}
                    >
                        Estimates
                    </MenuItem>

                    <MenuItem
                        Icon={Icons.orders}
                        onClick={() => {
                            _print("order");
                        }}
                    >
                        Order
                    </MenuItem>
                    {!props.mockup && (
                        <>
                            <MenuItem
                                Icon={Icons.packingList}
                                onClick={() => {
                                    _print("packing list");
                                }}
                            >
                                Packing List
                            </MenuItem>
                            <MenuItem
                                Icon={Icons.production}
                                onClick={() => {
                                    _print("production");
                                }}
                            >
                                Production
                            </MenuItem>
                        </>
                    )}
                </>
            );
        }
        if (props.ids) {
            return <PrintOptions />;
        }
        return props.myProd || props.estimate ? (
            <MenuItem
                Icon={Printer}
                onClick={() => {
                    if (props.estimate) _print("quote");
                    else _print("production");
                }}
            >
                Print {props.mockup && " Mockup"}
            </MenuItem>
        ) : (
            <MenuItem
                Icon={!props.pdf ? Printer : FileText}
                SubMenu={<PrintOptions />}
            >
                {!props.pdf ? <>Print {props.mockup && " Mockup"}</> : "Pdf"}
            </MenuItem>
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
        <MenuItem
            SubMenu={
                <>
                    <MenuItem
                        Icon={Icons.estimates}
                        onClick={() => {
                            _copyOrder("estimate");
                        }}
                    >
                        Estimates
                    </MenuItem>
                    <MenuItem
                        Icon={Icons.orders}
                        onClick={() => {
                            _copyOrder("order");
                        }}
                    >
                        Orders
                    </MenuItem>
                </>
            }
            Icon={Copy}
        >
            Copy As
        </MenuItem>
    );
});
export const ProductionAction = typedMemo(({ row }: IOrderRowProps) => {
    const router = useRouter();

    return (
        <MenuItem
            Icon={Icons.production}
            SubMenu={
                <>
                    <MenuItem
                        className=""
                        Icon={Icons.open}
                        href={`/sales/production/${row.orderId}`}
                    >
                        Open
                    </MenuItem>
                    <MenuItem
                        Icon={Icons.flag}
                        onClick={() => sales.productionModal(row)}
                    >
                        <span>
                            {row.prodId ? "Update Assignment" : "Assign"}
                        </span>
                    </MenuItem>
                    {row.prodStatus == "Completed" ? (
                        <MenuItem
                            Icon={Icons.flag}
                            onClick={() => sales.markIncomplete(row)}
                        >
                            <span>Incomplete</span>
                        </MenuItem>
                    ) : (
                        <>
                            <MenuItem
                                Icon={Icons.close}
                                onClick={() => sales._clearAssignment(row)}
                            >
                                <span>Clear Assign</span>
                            </MenuItem>
                            <MenuItem
                                Icon={Icons.check}
                                onClick={() => sales.completeProduction(row)}
                            >
                                <span>Mark as Completed</span>
                            </MenuItem>
                        </>
                    )}
                </>
            }
        >
            Production
        </MenuItem>
    );
});
