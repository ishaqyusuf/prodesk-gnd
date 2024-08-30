"use client";

import { use } from "react";
import { GetSalesAction } from "../_actions/get-sales-action";
import { useDataTableColumn2 } from "@/components/common/data-table/columns/use-data-table-columns";
import { screens } from "@/lib/responsive";
import { useMediaQuery } from "react-responsive";
import { SalesCells } from "./sales-cells";
import { DataTable } from "@/app/_components/data-table";
import { TableToolbar } from "@/app/_components/data-table/toolbar";
import { SalesPageType } from "../orders/page";

interface Props {
    response;
    type: SalesPageType;
}

export default function PageClient({ response, type }: Props) {
    const { data, pageCount }: GetSalesAction = use(response);

    const isMobile = useMediaQuery(screens.xs);
    function renderWebView(ctx) {
        // console.log({ type });

        switch (type) {
            case "orders":
                return [
                    ctx.Column("Order #", SalesCells.Order),
                    ctx.Column("Customer", SalesCells.Customer),
                    ctx.Column("Address", SalesCells.Address),
                    ctx.Column("Rep", SalesCells.SalesRep),
                    ctx.Column("Invoice", SalesCells.Invoice),
                    ctx.Column("Invoice Due", SalesCells.PaymentDueDate),
                    ctx.Column("Dispatch", SalesCells.Dispatch),
                    ctx.Column("Status", SalesCells.SalesStatus),
                    ctx.ActionColumn(SalesCells.SalesAction),
                ];
            case "quotes":
                return [
                    ctx.Column("Quote #", SalesCells.Order),
                    ctx.Column("Customer", SalesCells.Customer),
                    ctx.Column("Address", SalesCells.Address),
                    ctx.Column("Rep", SalesCells.SalesRep),
                    ctx.Column("Invoice", SalesCells.Invoice),
                    ctx.ActionColumn(SalesCells.SalesAction),
                ];
            case "delivery":
                return [
                    ctx.Column("Sales #", SalesCells.OrderDispatch),
                    ctx.Column("Shipping Address", SalesCells.Customer),
                    ctx.Column("Production", SalesCells.ProductionStatus),
                    ctx.ActionColumn(SalesCells.DeliveryAction),
                ];
            case "pickup":
                return [
                    ctx.Column("Sales #", SalesCells.OrderDispatch),
                    ctx.Column("Customer", SalesCells.Customer),
                    ctx.Column("Production", SalesCells.ProductionStatus),
                    ctx.ActionColumn(SalesCells.DeliveryAction),
                ];
        }
        return [];
    }
    const _table = useDataTableColumn2(
        data,
        {
            pageCount,
            cellVariants: {
                size: "sm",
            },
            filterCells: ["_status", "_q", "_payment", "_customerId", "_date"],
        },
        (ctx) => (isMobile ? [] : renderWebView(ctx))
    );

    return (
        <>
            <section className="content">
                <DataTable {..._table.props}>
                    <TableToolbar>
                        <TableToolbar.Search />
                    </TableToolbar>
                    <DataTable.Table />
                    <DataTable.Footer />
                </DataTable>
            </section>
        </>
    );
}
