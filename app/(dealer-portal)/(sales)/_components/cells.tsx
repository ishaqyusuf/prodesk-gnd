"use client";

import { TableCell } from "@/app/_components/data-table/table-cells";
import { GetSales } from "@/data-acces/sales";

interface CellProps {
    item: GetSales["data"][number];
}

function Order({ item }: CellProps) {
    return (
        <TableCell>
            <TableCell.Primary>{item.orderId}</TableCell.Primary>
        </TableCell>
    );
}

export let Cells = {
    Order,
};
