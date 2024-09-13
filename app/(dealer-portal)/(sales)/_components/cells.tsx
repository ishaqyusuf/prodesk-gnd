"use client";

import {
    SalesCellProps,
    SalesCells,
} from "@/app/(v2)/(loggedIn)/sales/dashboard/_components/sales-cells";
import { TableCol } from "@/components/common/data-table/table-cells";

function Order({ item }: SalesCellProps) {
    const href = item.isDyke
        ? `/sales-form/${item.type}/${item.slug}`
        : `/sales-form/${item.type}/${item.slug}`;
    return <SalesCells.OrderDispatch item={item} href={href} />;
}
function DispatchStatus({ item }: SalesCellProps) {}
function OrderAction({ item }: SalesCellProps) {
    // item.status
    return <TableCol></TableCol>;
}
export let Cells = {
    Order,
    Invoice: SalesCells.Invoice,
    Address: SalesCells.Address,
    Customer: ({ item }) => <SalesCells.Customer item={item} noLink />,
    Dispatch: SalesCells.Dispatch,
    Status: SalesCells.SalesStatus,
    OrderAction,
};
