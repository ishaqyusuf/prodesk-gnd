"use client";

import { copyOrderAction, moveSales } from "@/app/_actions/sales/sales";
import { toast } from "sonner";
import { closeModal, openModal } from "../modal";
import { ISalesOrder, IOrderType, IOrderPrintMode } from "@/types/sales";
import {
    adminCompleteProductionAction,
    cancelProductionAssignmentAction,
    markProductionIncompleteAction
} from "@/app/_actions/sales/sales-production";
import optionBuilder from "../option-builder";
import { Icons } from "@/components/icons";
import { env } from "@/env.mjs";
import QueryString from "qs";
import { dispatchSlice } from "@/store/slicers";

export const sales = {
    async move(order, to: "estimate" | "order", router?) {
        await moveSales(order.id, to);
        toast.message("Order moved to estimate");
        router?.push(`/sales/${to}/${order.orderId}`);
        closeModal();
    },
    async copy(order, as: IOrderType = "order") {
        const _ = await copyOrderAction({
            orderId: order.orderId,
            as
        });
        toast.success(`${as} copied successfully`, {
            // action: {
            //     label: "Open"
            //     // onClick: () =>
            //     // router.push(`/sales/${as}/${_.orderId}/form`)
            // }
        });
    },
    productionModal(order) {
        const { id, orderId, prodDueDate, prodId } = order;

        openModal("assignProduction", {
            id,
            orderId,
            prodDueDate,
            prodId
        });
    },
    async markIncomplete(row) {
        await markProductionIncompleteAction(row.id);
        toast.message("Production Marked as Incomplete");
        closeModal();
    },
    async _clearAssignment(row) {
        await cancelProductionAssignmentAction(row.id);
        toast.message("Production Assignment Cancelled");
        closeModal();
    },
    async completeProduction(row) {
        await adminCompleteProductionAction(row.id);
        toast.message("Production Completed");
        closeModal();
    },
    salesMenuOption(row: ISalesOrder) {
        const estimate = row.type == "estimate";
        const _linkDir = `/sales/${row.type}/${row.slug}`;
        const mb = optionBuilder;
        const prodCompleted = row?.prodStatus == "Completed";
        return [
            mb.href("View", _linkDir, Icons.view),
            mb.href("Edit", `${_linkDir}/form`, Icons.edit),
            !estimate &&
                mb.more(
                    "Production",
                    [
                        mb.href(
                            "Open",
                            `/sales/production/${row?.slug}`,
                            Icons.open
                        ),
                        mb.simple(
                            row?.prodId ? "Update Assignment" : "Assign",
                            () => this.productionModal(row),
                            Icons.flag
                        ),
                        ...(prodCompleted
                            ? [
                                  mb.simple(
                                      "Clear Assign",
                                      () => this._clearAssignment(row),
                                      Icons.close
                                  ),
                                  mb.simple(
                                      "Mark as Completed",
                                      () => this.completeProduction(row),
                                      Icons.check
                                  )
                              ]
                            : [])
                    ],
                    Icons.production
                ),
            mb.simple(
                !estimate ? "Move to Estimate" : "Move to Order",
                async () =>
                    await this.move(row, estimate ? "order" : "estimate"),
                estimate ? Icons.orders : Icons.estimates
            ),
            mb.more(
                "Copy",
                [
                    mb.simple(
                        "As Order",
                        async () => {
                            await this.copy(row, "order");
                        },
                        Icons.orders
                    ),
                    mb.simple(
                        "As Estimate",
                        async () => {
                            await this.copy(row, "estimate");
                        },
                        Icons.estimates
                    )
                ],
                Icons.copy
            ),
            this.printMenu(row, "Print", false, "main"),
            this.printMenu(row, "Print Mockup", true, "main"),
            this.printMenu(row, "Pdf", false, "pdf")
            // {delete: true,action: _delete}
        ].filter(Boolean);
    },
    //    ids, mode: IOrderPrintMode, mockup, print = true
    print(props: {
        id;
        mode: IOrderPrintMode;
        mockup?: boolean;
        prints?: boolean;
        pdf?: boolean;
    }) {
        if (props.pdf) {
            const { mode, id } = props;
            dispatchSlice("printOrders", {
                mode,
                pdf: props.pdf,
                mockup: props.mockup,
                ids: id,
                isClient: !["production", "packing list"].includes(mode),
                showInvoice: ["order", "quote", "invoice"].includes(mode),
                packingList: mode == "packing list",
                isProd: mode == "production"
            });

            return;
        }
        const link = document.createElement("a");
        const prod = env.NEXT_PUBLIC_NODE_ENV == "production";
        let base = prod
            ? `https://gnd-prodesk.vercel.app`
            : "http://localhost:3000";
        const href = (link.href = `${base}/print-sales?${QueryString.stringify(
            props
        )}`);
        QueryString.stringify(props);
        console.log(href);
        link.target = "_blank";
        link.click();
    },
    printMenu(row, title, mockup, type) {
        const mb = optionBuilder;
        function _print(mode: IOrderPrintMode) {
            printOrder({
                id: [row.id].join(","),
                mode,
                mockup,
                pdf: type == "pdf",
                prints: true
            });
        }
        return optionBuilder.more(
            title,
            [
                mb.simple("Estimate", () => _print("quote"), Icons.estimates),
                mb.simple("Order", () => _print("order"), Icons.orders),
                mb.simple(
                    "Packing List",
                    () => _print("packing list"),
                    Icons.packingList
                ),
                mb.simple(
                    "Production",
                    () => _print("production"),
                    Icons.production
                )
            ],
            type == "pdf" ? Icons.edit : Icons.print
        );
    }
};
const printOrder = sales.print;
