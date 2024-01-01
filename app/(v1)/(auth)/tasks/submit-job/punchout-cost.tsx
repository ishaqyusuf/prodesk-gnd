"use client";

import { SubmitModalContext } from "./context";
import { useContext } from "react";
import { _punchoutCosts } from "../_actions/punchout-costs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CostRow } from "./submit-job-modal";

export default function PunchoutCost({}) {
    const ctx = useContext(SubmitModalContext);
    return (
        <div className="col-span-2">
            <Table className="">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-1">Task</TableHead>
                        <TableHead className="px-1">Qty</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ctx.costList.map((row, i) => (
                        <CostRow key={i} row={row} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
