"use client";

import { IOrderPrintMode, ISalesType, ISalesOrder } from "@/types/sales";

import { Copy, FileText, Pen, Printer, View } from "lucide-react";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    copyOrderAction,
    deleteOrderAction,
    moveSales,
} from "@/app/(v1)/_actions/sales/sales";
import { toast } from "sonner";
import { Icons } from "../icons";
import {
    DeleteRowAction,
    MenuItem,
    RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import AuthGuard from "../auth-guard";
import { env } from "@/env.mjs";
import { sales } from "@/lib/sales/sales-helper";
import { _cancelBackOrder } from "@/app/(v2)/(loggedIn)/sales/_actions/cancel-back-order";
import salesData from "@/app/(v2)/(loggedIn)/sales/sales-data";
import { updateDeliveryModeDac } from "@/app/(v2)/(loggedIn)/sales/_data-access/update-delivery-mode.dac";
import useSalesPdf from "@/app/(v2)/printer/sales/use-sales-pdf";
import QueryString from "qs";
import AssignProductionModal from "@/app/(v2)/(loggedIn)/sales/_modals/assign-production-modal";
import { useModal } from "@/components/common/modal/provider";
import SendEmailSheet from "@/components/_v2/email/send-email";
import { copyDykeSales } from "@/app/(v1)/(loggedIn)/sales/_actions/copy-dyke-sale";

export interface IOrderRowProps {
    row: ISalesOrder;
    viewMode?: Boolean;
    estimate?: Boolean;
    print?(mode: ISalesType | "production");
    myProd?: Boolean;
}
export function OrderRowAction(props: IOrderRowProps) {
    const { row, viewMode, estimate } = props;
    const _linkDir = row.isDyke
        ? `/sales-v2/overview/${row.type}/${row.slug}`
        : `/sales/${row.type}/${row.slug}`;
    const router = useRouter();
    async function moveEstimateToOrder() {
        await moveSales(row.id, "order");
        toast.message("Estimate moved to order");
        router.push(`/sales/order/${row.orderId}`);
    }
    async function moveToEstimate() {
        await moveSales(row.id, "quote");
        toast.message("Order moved to quote");
        router.push(`/sales/quote/${row.orderId}`);
    }
    async function updateDeliveryMode(delivery) {
        if (delivery != row.deliveryOption) {
            await updateDeliveryModeDac(
                row.id,
                delivery,
                row.type == "order" ? "orders" : "quotes"
            );

            toast.success("Updated");
        }
    }
    const modal = useModal();
    return (
        <AuthGuard can={["editOrders"]} className="">
            <RowActionMoreMenu>
                <MenuItem Icon={View} link={_linkDir}>
                    View
                </MenuItem>
                <MenuItem
                    Icon={Pen}
                    link={
                        row.isDyke
                            ? `/sales-v2/form/${row.type}/${row.slug}`
                            : `/sales/edit/${row.type}/${row.slug}`
                    }
                >
                    Edit
                </MenuItem>
                <MenuItem
                    Icon={Icons.Email}
                    onClick={() => {
                        const email =
                            row.billingAddress?.email ||
                            row.shippingAddress?.email ||
                            row.customer?.email;

                        modal?.openSheet(
                            <SendEmailSheet
                                data={{
                                    parentId: row.id,
                                    to: email as any,
                                    type:
                                        row.type == "order" ? "sales" : "quote",
                                }}
                                subtitle={`Sales Order | ${row.orderId}`}
                            />
                        );
                        // openEmailComposer(row, {
                        //     type: "sales",
                        //     parentId: row.id,
                        // });
                    }}
                >
                    Email
                </MenuItem>
                {row.slug?.toLowerCase().endsWith("-bo") ? (
                    <MenuItem
                        Icon={Icons.close}
                        onClick={async () => {
                            await _cancelBackOrder(row.slug);
                            toast.success("Backorder Cancelled");
                        }}
                    >
                        Cancel Back Order
                    </MenuItem>
                ) : (
                    <MenuItem
                        href={`/sales/back-orders/create?orderIds=${row.slug}`}
                        Icon={Icons.Merge}
                    >
                        Back Order
                    </MenuItem>
                )}
                {!estimate ? (
                    <>
                        {!row.isDyke ? <ProductionAction row={row} /> : <></>}
                        <MenuItem
                            Icon={Icons.delivery}
                            SubMenu={
                                <>
                                    {salesData.delivery.map((o) => (
                                        <MenuItem
                                            onClick={() =>
                                                updateDeliveryMode(o.value)
                                            }
                                            // Icon={
                                            //     row.deliveryOption ==
                                            //     o.value ? (
                                            //         <Icons.check />
                                            //     ) : (
                                            //         <Icons.check />
                                            //     )
                                            // }
                                            key={o}
                                        >
                                            {o.text}
                                        </MenuItem>
                                    ))}
                                </>
                            }
                        >
                            Delivery
                        </MenuItem>

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
        const pdf = useSalesPdf();
        async function _print(mode: IOrderPrintMode) {
            const ids = props.ids || [props.row.slug];
            const query = {
                slugs: ids.join(","),
                mode: mode as any,
                mockup: props.mockup ? "yes" : "no",
                preview: false,
            };
            if (props.link) {
                const link = document.createElement("a");
                let base = env.NEXT_PUBLIC_APP_URL;
                link.target = "_blank";
                link.href = `${base}/printer/sales?${QueryString.stringify(
                    query
                )}`;
                // link.href = `${base}/print-sales?id=${ids}&mode=${mode}&prints=true&mockup=${props.mockup}`;
                // link.download = "file.pdf";
                // document.body.appendChild(link);
                link.click();
            } else {
                pdf.print({
                    slugs: ids.join(","),
                    mode: mode as any,
                    mockup: props.mockup ? "yes" : "no",
                    preview: false,
                    pdf: true,
                });
                // dispatchSlice("printOrders", {
                //     mode,
                //     pdf: props.pdf,
                //     mockup: props.mockup,
                //     ids,
                //     isClient: !["production", "packing list"].includes(mode),
                //     showInvoice: ["order", "quote", "invoice"].includes(mode),
                //     packingList: mode == "packing list",
                //     isProd: mode == "production",
                // });
            }
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
                Icon={!props.pdf ? Printer : FileText}
                onClick={() => {
                    if (props.estimate) _print("quote");
                    else _print("production");
                }}
            >
                {!props.pdf ? <>Print {props.mockup && " Mockup"}</> : "Pdf"}
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
        async (as: ISalesType = "order") => {
            startTransition(async () => {
                const _ = props.row.isDyke
                    ? await copyDykeSales(props.row.slug, as)
                    : await copyOrderAction({
                          orderId: props.row.orderId,
                          as,
                      });
                toast.success(`${as} copied successfully`, {
                    action: {
                        label: "Open",
                        onClick: () => router.push(_.link),
                    },
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
                            _copyOrder("quote");
                        }}
                    >
                        Quote
                    </MenuItem>
                    <MenuItem
                        Icon={Icons.orders}
                        onClick={() => {
                            _copyOrder("order");
                        }}
                    >
                        Order
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
    const modal = useModal();
    function openAssignProd(order) {
        modal?.openModal(<AssignProductionModal order={order} />);
    }
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
                        onClick={() => openAssignProd(row)}
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
