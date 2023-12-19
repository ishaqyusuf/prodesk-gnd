"use client";

import { SubmitModalContext } from "./context";
import { useContext, useEffect, useState } from "react";
import { InstallCostLine } from "@/types/settings";
import { _punchoutCosts } from "../_actions/punchout-costs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    PrimaryCellContent,
    SecondaryCellContent,
} from "@/components/columns/base-columns";
import Money from "@/components/money";
import { cn } from "@/lib/utils";
import { CheckCheck, CheckSquare, Square } from "lucide-react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";

export default function PunchoutCost({}) {
    const ctx = useContext(SubmitModalContext);

    return (
        <div className="col-span-2">
            <Table className="">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-1">Task</TableHead>
                        <TableHead className="px-1">Select</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ctx.costList.map((ls) => (
                        <CostRow cost={ls} key={ls.uid} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
function CostRow({ cost }: { cost: InstallCostLine }) {
    const ctx = useContext(SubmitModalContext);
    const formKey = `meta.costData.${cost.uid}.qty`;
    // const qty = ctx.form.watch(formKey as any);

    return (
        <FormField
            control={ctx.form.control}
            name={formKey as any}
            render={({ field }) => (
                <FormControl>
                    <TableRow
                        onClick={() => {
                            field.onChange(field.value == 1 ? 0 : 1);
                            // ctx.form.setValue(
                            //     formKey as any,
                            //     field.value == 1 ? 0 : 1
                            // );
                        }}
                        className={cn(
                            field.value == 1
                                ? "bg-green-200 hover:bg-green-200"
                                : ""
                        )}
                        key={cost.uid}
                    >
                        <TableCell className="px-1">
                            <PrimaryCellContent>
                                {cost.title}
                            </PrimaryCellContent>
                            <SecondaryCellContent>
                                <Money value={cost.cost} />
                            </SecondaryCellContent>
                        </TableCell>
                        <TableCell className="">
                            {field.value == 1 ? <CheckCheck /> : <Square />}
                        </TableCell>
                    </TableRow>
                </FormControl>
            )}
        />
    );
}
