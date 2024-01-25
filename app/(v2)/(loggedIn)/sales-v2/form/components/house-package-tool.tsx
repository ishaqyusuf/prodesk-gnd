import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DykeItemFormContext, useDykeForm } from "../../form-context";
import { useContext, useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { getDimensionSizeList } from "../../dimension-variants/_actions/get-size-list";
import ControlledInput from "@/_v2/components/controls/controlled-input";
import { Button } from "@/components/ui/button";
import Money from "@/components/_v1/money";
import { calculateSalesEstimate } from "../../_utils/calculate-sales-estimate";

interface Props {}
export default function HousePackageTool({}: Props) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const prices = ["Door", "Jamb Size", "Casing"];
    const [sizeList, setSizeList] = useState<{ dim: string; width: string }[]>(
        []
    );
    const rootKey = `itemArray.${item.rowIndex}.item.meta.housePackageTool`;
    const doorsKey = `${rootKey}.doors`;
    const packageTool = form.watch(
        `itemArray.${item.rowIndex}.item.meta.housePackageTool`
    );

    function calculate() {
        // console.log(packageTool);
        // calculateSalesEstimate(form);

        let sum = {
            doors: 0,
            unitPrice: 0,
            totalPrice: 0,
        };
        Object.entries(packageTool.doors).map(([k, v]) => {
            let doors = v.leftHand + v.rightHand;
            let unitPrice = Object.values(v.prices).reduce((a, b) => a + b, 0);
            let sumTotal = 0;
            if (doors && unitPrice) {
                sumTotal = doors * unitPrice;
                sum.doors += doors;
                sum.unitPrice += unitPrice;
                sum.totalPrice += sumTotal;
            }
            form.setValue(`${rootKey}.doors.${k}.unitPrice` as any, unitPrice);
            form.setValue(`${rootKey}.doors.${k}.lineTotal` as any, sumTotal);
        });
        form.setValue(`${rootKey}.totalPrice` as any, sum.totalPrice);
        form.setValue(`${rootKey}.totalDoors` as any, sum.doors);
    }
    useEffect(() => {
        (async () => {
            console.log(packageTool);
            const list = await getDimensionSizeList(packageTool.height);
            console.log(list);
            setSizeList(list as any);
        })();
    }, []);
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableHead>Width</TableHead>
                    <TableHead className="w-[100px]">LH</TableHead>
                    <TableHead className="w-[100px]">RH</TableHead>
                    <TableHead>Unit Dimension</TableHead>
                    <TableHead className="">
                        <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                            <div className="flex pb-1 justify-center">
                                <p>Price</p>
                            </div>
                            <div className="flex pt-1 justify-between">
                                {prices.map((p) => (
                                    <div className="flex-1" key={p}>
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TableHead>
                    <TableHead>Line Total</TableHead>
                </TableHeader>
                <TableBody>
                    {sizeList.map((row) => (
                        <TableRow key={row.dim}>
                            <TableCell>{row.width}</TableCell>
                            <TableCell>
                                {/* <SwingInput /> */}
                                <ControlledInput
                                    type="number"
                                    control={form.control}
                                    name={
                                        `${doorsKey}.${row.width}.leftHand` as any
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <ControlledInput
                                    type="number"
                                    control={form.control}
                                    name={
                                        `${doorsKey}.${row.width}.rightHand` as any
                                    }
                                />
                            </TableCell>
                            <TableCell>{row.dim}</TableCell>
                            <TableCell className="">
                                <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                                    <div className="flex pt-1 justify-between">
                                        {prices.map((p) => (
                                            <div className="flex-1" key={p}>
                                                <div className="mx-1">
                                                    <ControlledInput
                                                        type="number"
                                                        control={form.control}
                                                        name={
                                                            `${doorsKey}.${row.width}.prices.${p}` as any
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Money
                                    value={
                                        packageTool.doors?.[row.width]
                                            ?.unitPrice
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <Money
                                    value={
                                        packageTool.doors?.[row.width]
                                            ?.lineTotal
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-end">
                <Button onClick={calculate} variant={"secondary"}>
                    Calculate Price
                </Button>
            </div>
        </div>
    );
}
