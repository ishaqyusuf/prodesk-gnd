"use client";

import { Icons } from "@/components/_v1/icons";
import { useSalesBlockCtx } from "../sales-print-block";
import Text from "../../components/print-text";
import React from "react";

export default function SalesPrintDoorItems() {
    const ctx = useSalesBlockCtx();
    const { sale } = ctx;

    if (!sale.doorsTable) return <></>;
    return (
        <tr>
            <td colSpan={16} className="">
                {sale.doorsTable.doors.map((dt, index) => (
                    <table className="table-fixed w-full border" key={index}>
                        <thead id="topHeader">
                            <th
                                className="p-2 text-start uppercase text-base bg-slate-200"
                                colSpan={16}
                            >
                                {dt.doorType}
                            </th>
                        </thead>
                        <tbody className="">
                            <tr>
                                <td colSpan={16}>
                                    <div className="grid grid-cols-2">
                                        {dt.details
                                            .filter((d) => d.value)
                                            .filter(
                                                (d) =>
                                                    !["Height"].includes(
                                                        d.step?.title as any
                                                    )
                                            )
                                            .map((detail) => (
                                                <div
                                                    key={detail.id}
                                                    className="grid grid-cols-5 border-b border-r  gap-2"
                                                >
                                                    <div className="font-bold col-span-2  border-r px-2 py-1">
                                                        {detail.step.title}
                                                    </div>
                                                    <div className=" col-span-3 px-2 py-1">
                                                        {detail.value}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={16}>
                                    <table className="table-fixed w-full printly">
                                        <thead className="">
                                            <tr>
                                                {sale.doorsTable?.cells.map(
                                                    (cell, i) => (
                                                        <th
                                                            className="border px-2"
                                                            colSpan={
                                                                cell.colSpan
                                                            }
                                                        >
                                                            <Text
                                                                {...cell.style}
                                                            >
                                                                {cell.title}
                                                            </Text>
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        {dt.lines?.map((line, i) => (
                                            <tr key={i}>
                                                {line.map((ld, ldi) => (
                                                    <td
                                                        className="border px-2"
                                                        colSpan={ld.colSpan}
                                                        key={ldi}
                                                    >
                                                        <Text {...ld.style}>
                                                            {ld.value}
                                                        </Text>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </table>
                                </td>
                            </tr>
                            {/* ))} */}
                        </tbody>
                    </table>
                ))}
            </td>
        </tr>
    );
}
