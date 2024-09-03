"use client";

import {
    SalesCellProps,
    SalesCells,
} from "@/app/(v2)/(loggedIn)/sales/dashboard/_components/sales-cells";

function Order({ item }: SalesCellProps) {
    const href = item.isDyke
        ? `/overview/${item.type}/${item.slug}`
        : `/overview/${item.type}/${item.slug}`;
    return <SalesCells.OrderDispatch item={item} href={href} />;
}
function DispatchStatus({ item }: SalesCellProps) {}
function OrderAction({ item }: SalesCellProps) {}
export let Cells = {
    Order,
    Invoice: SalesCells.Invoice,
    Address: SalesCells.Address,
    Customer: SalesCells.Customer,
    Dispatch: SalesCells.Dispatch,
    Status: SalesCells.SalesStatus,
    OrderAction,
};
