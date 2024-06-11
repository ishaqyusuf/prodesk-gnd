"use client";

import {
    copyOrderAction,
    moveSales,
} from "@/app/(v1)/(loggedIn)/sales/_actions/sales";
import { toast } from "sonner";
import { closeModal, openEmailComposer, openModal } from "../modal";
import { ISalesOrder, ISalesType, IOrderPrintMode } from "@/types/sales";
import {
    adminCompleteProductionAction,
    cancelProductionAssignmentAction,
    markProductionIncompleteAction,
} from "@/app/(v1)/(loggedIn)/sales/_actions/sales-production";
import optionBuilder from "../option-builder";
import { Icons } from "@/components/_v1/icons";
import { env } from "@/env.mjs";
import QueryString from "qs";

export const sales = {
    async move(order, to: ISalesType, router?) {
        await moveSales(order.id, to);
        toast.message(
            to == "quote" ? "Order moved to quote" : "Quote moved to order"
        );
        router?.push(`/sales/${to}/${order.orderId}`);
        closeModal();
    },
    async copy(order, as: ISalesType = "order") {
        const _ = await copyOrderAction({
            orderId: order.orderId,
            as,
        });
        toast.success(`${as} copied successfully`, {});
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
    salesMenuOption(row: ISalesOrder, modal, pdf) {
        const estimate = row.type == "quote";
        const _linkDir = `/sales/${row.type}/${row.slug}`;
        const mb = optionBuilder;
        const prodCompleted = row?.prodStatus == "Completed";
        return [
            mb.href("View", _linkDir, Icons.view),
            mb.href("Edit", `${_linkDir}/form`, Icons.edit),
            mb.simple(
                "Email",
                () => {
                    openEmailComposer(row, {
                        type: "sales",
                        parentId: row.id,
                    });
                },
                Icons.Email
            ),
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
                            () => {
                                //  modal.open(
                                //      <AssignProductionModal order={row} />
                                //  );
                            },
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
                                  ),
                              ]
                            : []),
                    ],
                    Icons.production
                ),
            mb.simple(
                !estimate ? "Move to Quote" : "Move to Order",
                async () => await this.move(row, estimate ? "order" : "quote"),
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
                        "As Quote",
                        async () => {
                            await this.copy(row, "quote");
                        },
                        Icons.estimates
                    ),
                ],
                Icons.copy
            ),
            this.printMenu(row, "Print", false, "main", pdf),
            this.printMenu(row, "Print Mockup", true, "main", pdf),
            this.printMenu(row, "Pdf", false, "pdf", pdf),
            // {delete: true,action: _delete}
        ].filter(Boolean);
    },
    //    ids, mode: IOrderPrintMode, mockup, print = true
    print(
        props: {
            ids;
            mode: IOrderPrintMode;
            mockup?: boolean;
            prints?: boolean;
            pdf?: boolean;
        },
        pdf
    ) {
        if (props.pdf) {
            // const { mode, ids } = props;
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
            // return;
            pdf.print({
                slugs: props.ids.join(","),
                mode: props.mode as any,
                mockup: props.mockup ? "yes" : "no",
                preview: false,
                pdf: true,
            });
            return;
        }
        const query = {
            slugs: props.ids.join(","),
            mode: props.mode as any,
            mockup: props.mockup ? "yes" : "no",
            preview: false,
        };
        const link = document.createElement("a");

        let base = env.NEXT_PUBLIC_APP_URL;
        const href =
            (link.href = `${base}/printer/sales?${QueryString.stringify(
                query
            )}`);
        QueryString.stringify(props);
        // console.log(href);
        link.target = "_blank";
        link.click();
    },
    printMenu(row, title, mockup, type, pdf) {
        const mb = optionBuilder;
        function _print(mode: IOrderPrintMode) {
            printOrder(
                {
                    ids: [row.slug],
                    mode,
                    mockup,
                    pdf: type == "pdf",
                    prints: true,
                },
                pdf
            );
            closeModal();
        }
        return optionBuilder.more(
            title,
            [
                mb.simple("Quote", () => _print("quote"), Icons.estimates),
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
                ),
            ],
            type == "pdf" ? Icons.edit : Icons.print
        );
    },
};
const printOrder = sales.print;
