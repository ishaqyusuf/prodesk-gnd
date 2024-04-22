import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DykeItemFormContext, useDykeForm } from "../../../form-context";
import { useContext, useEffect, useState } from "react";
import { getDimensionSizeList } from "../../../dimension-variants/_actions/get-size-list";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Button } from "@/components/ui/button";
import Money from "@/components/_v1/money";

import { formatMoney } from "@/lib/use-number";
import { camel, cn } from "@/lib/utils";

interface Props {
    rowIndex?;
}
export default function HousePackageTool({}: Props) {
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
    const rootKey = `itemArray.${item.rowIndex}.item.housePackageTool`;
    const doorsKey = `${rootKey}._doorForm`;
    const height = form.watch(
        `itemArray.${item.rowIndex}.item.housePackageTool.height`
    );
    const _doorForm = form.watch(
        `itemArray.${item.rowIndex}.item.housePackageTool._doorForm`
    );
    console.log(_doorForm);

    function calculate() {
        let sum = {
            doors: 0,
            unitPrice: 0,
            totalPrice: 0,
        };

        Object.entries(_doorForm).map(([k, v]) => {
            let doors = v.lhQty || 0 + v.rhQty || 0;
            const {
                doorPrice = 0,
                casingPrice = 0,
                jambSizePrice = 0,
            } = v as any;

            let unitPrice = formatMoney(
                Object.values({
                    doorPrice,
                    casingPrice,
                    jambSizePrice,
                }).reduce((a, b) => a + b, 0)
            );
            let sumTotal = 0;
            if (doors && unitPrice) {
                sumTotal = doors * unitPrice;
                sum.doors += doors;
                sum.unitPrice += unitPrice;
                sum.totalPrice += sumTotal;
            }
            form.setValue(
                `${rootKey}._doorForm.${k}.unitPrice` as any,
                unitPrice
            );
            console.log({
                sumTotal,
                doors,
                doorPrice,
                unitPrice,
            });

            form.setValue(
                `${rootKey}._doorForm.${k}.lineTotal` as any,
                sumTotal
            );
        });
        form.setValue(`${rootKey}.totalPrice` as any, sum.totalPrice);
        form.setValue(`${rootKey}.totalDoors` as any, sum.doors);
    }

    useEffect(() => {
        const itemArray = item.get.itemArray();
        console.log(itemArray);
        const selection = Object.entries(itemArray.multiComponent).map(
            ([k, v]) => {
                if (v.checked) {
                    console.log(v);

                    const ls = Object.values(v.height || {})
                        .filter((i) => i.checked)
                        ?.map((s) => {
                            s.dim = s.dim?.replaceAll('"', "in");
                            return s;
                        }) as any;
                    // console.log(v);

                    setSizeList(ls);
                }
            }
        );
        // (async () => {
        //     // console.log(height);

        //     // const list = await getDimensionSizeList(
        //     //     height,
        //     //     doorType == "Bifold"
        //     // );
        //     // // console.log(list);
        //     // setSizeList(list as any);
        // })();
    }, []);
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableHead>Width</TableHead>
                    {doorType == "Bifold" ? (
                        <>
                            <TableHead className="w-[100px]">Qty</TableHead>
                        </>
                    ) : (
                        <>
                            <TableHead className="w-[100px]">LH</TableHead>
                            <TableHead className="w-[100px]">RH</TableHead>
                        </>
                    )}

                    <TableHead>Unit Dimension</TableHead>
                    <TableHead className="">
                        {doorType == "Bifold" ? (
                            <>Price</>
                        ) : (
                            <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                                <div className="flex pb-1 justify-center">
                                    <p>Price</p>
                                </div>
                                <div className="flex pt-1 justify-between">
                                    {prices.map((p) => (
                                        <div className="flex-1" key={p.title}>
                                            {p.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Line Total</TableHead>
                </TableHeader>
                <TableBody>
                    {sizeList.map((row) => (
                        <TableRow key={row.dim}>
                            <TableCell>{row.width}</TableCell>
                            {doorType == "Bifold" ? (
                                <>
                                    <TableCell>
                                        {/* <SwingInput /> */}
                                        <ControlledInput
                                            type="number"
                                            list
                                            control={form.control}
                                            name={
                                                `${doorsKey}.${row.dim}.lhQty` as any
                                            }
                                        />
                                    </TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>
                                        {/* <SwingInput /> */}
                                        <ControlledInput
                                            type="number"
                                            list
                                            control={form.control}
                                            name={
                                                `${doorsKey}.${row.dim}.lhQty` as any
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <ControlledInput
                                            type="number"
                                            list
                                            control={form.control}
                                            name={
                                                `${doorsKey}.${row.dim}.rhQty` as any
                                            }
                                        />
                                    </TableCell>
                                </>
                            )}
                            <TableCell>
                                {row.dim?.replaceAll("in", '"')}
                            </TableCell>
                            <TableCell className="">
                                <div className="flex max-w-[300px] flex-col justify-center items-stretch divide-y">
                                    <div className="flex pt-1 justify-between">
                                        {prices.map((p) => (
                                            <div
                                                className="flex-1"
                                                key={p.title}
                                            >
                                                <div className="mx-1">
                                                    <ControlledInput
                                                        type="number"
                                                        className={cn(
                                                            prices.length ==
                                                                1 && "w-[80px]"
                                                        )}
                                                        control={form.control}
                                                        list
                                                        name={
                                                            `${doorsKey}.${row.dim}.${p.key}` as any
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
                                    value={_doorForm?.[row.dim]?.unitPrice}
                                />
                            </TableCell>
                            <TableCell>
                                <Money
                                    value={_doorForm?.[row.dim]?.lineTotal}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-end">
                <Button onClick={calculate} type="button" variant={"secondary"}>
                    Calculate Price
                </Button>
            </div>
        </div>
    );
}
