"use client";

import { TableCol } from "@/components/common/data-table/table-cells";
import { GetSales } from "@/data-acces/sales";

interface CellProps {
    item: GetSales["data"][number];
}

function Order({ item }: CellProps) {
    return (
        <TableCol>
            <TableCol.Primary>{item.orderId}</TableCol.Primary>
        </TableCol>
    );
}

export let Cells = {
    Order,
};
