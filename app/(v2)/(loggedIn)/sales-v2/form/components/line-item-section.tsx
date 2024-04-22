import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DykeItemFormContext, useDykeForm } from "../../form-context";
import { useContext, useEffect, useState } from "react";

import ControlledInput from "@/components/common/controls/controlled-input";
import { Button } from "@/components/ui/button";
import Money from "@/components/_v1/money";

import { camel, cn } from "@/lib/utils";

interface Props {
    rowIndex;
}
export default function LineItemSection({ rowIndex }: Props) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const doorType = item.get.doorType();
    const prices = (
        doorType == "Bifold" ? ["Door"] : ["Door", "Jamb Size", "Casing"]
    ).map((title) => ({
        title,
        key: camel(`${title} price`),
    }));
    const [sizeList, setSizeList] = useState<{ dim: string; width: string }[]>(
        []
    );
    const rootKey = `itemArray.${item.rowIndex}.item`;
    const doorsKey = `${rootKey}._doorForm`;

    const _lineTotal = form.watch(`itemArray.${item.rowIndex}.item.total`);

    function calculate() {
        // console.log("....");
        const [price, qty] = form.getValues([
            `${rootKey}.price`,
            `${rootKey}.qty`,
        ] as any);
        const lineTotal = (price || 0) * (qty || 0);
        console.log(lineTotal);
        form.setValue(`${rootKey}.total` as any, lineTotal);
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Line Total</TableHead>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <ControlledInput
                                type="number"
                                list
                                control={form.control}
                                name={`${rootKey}.qty` as any}
                            />
                        </TableCell>
                        <TableCell>
                            <ControlledInput
                                type="number"
                                list
                                control={form.control}
                                name={`${rootKey}.price` as any}
                            />
                        </TableCell>
                        <TableCell>
                            <Money value={_lineTotal} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <div className="flex justify-end">
                <Button type="button" onClick={calculate} variant={"secondary"}>
                    Calculate Price
                </Button>
            </div>
        </div>
    );
}
