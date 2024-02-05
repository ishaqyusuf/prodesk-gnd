"use client";

import { Icons } from "@/components/_v1/icons";
import { useSalesBlockCtx } from "../sales-print-block";
import Text from "../../components/print-text";
import React from "react";

export default function SalesPrintShelfItems() {
    const ctx = useSalesBlockCtx();
    const { sale } = ctx;
    if (!sale.shelfItemsTable) return <></>;
    return (
        <tr className="">
            <td className="my-4" colSpan={16}>
                <table className="table-fixed w-full border">
                    <thead id="topHeader">
                        <th
                            className="p-2 text-start uppercase text-base bg-slate-200"
                            colSpan={16}
                        >
                            Shelf Items
                        </th>
                    </thead>
                    <thead id="topHeader">
                        {sale.shelfItemsTable?.cells?.map((cell, i) => (
                            <th className="border px-2" colSpan={cell.colSpan}>
                                <Text {...cell.style}>{cell.title}</Text>
                            </th>
                        ))}
                    </thead>
                    <tbody>
                        {sale.shelfItemsTable?.items?.map((cells, i) => (
                            <tr key={i}>
                                {cells.map((cel, i) => (
                                    <td
                                        className="border px-2"
                                        colSpan={cel.colSpan}
                                    >
                                        <Text {...cel.style}>{cel.value}</Text>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </td>
        </tr>
    );
}
