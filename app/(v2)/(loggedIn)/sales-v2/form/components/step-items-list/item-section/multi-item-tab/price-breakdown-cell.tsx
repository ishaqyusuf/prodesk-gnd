import Money from "@/components/_v1/money";
import ControlledInput from "@/components/common/controls/controlled-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TableCell } from "@/components/ui/table";
import { useDykeForm } from "../../../../_hooks/form-context";
import { sum } from "@/lib/utils";
import { useMultiComponentItem } from "../../../../_hooks/use-multi-component-item";
import { Form } from "@/components/ui/form";
import { TableCol } from "@/components/common/data-table/table-cells";
import { useState } from "react";

interface Props {
    sizeRow?;
    componentItem?: ReturnType<typeof useMultiComponentItem>;
}
export default function PriceBreakDownCell({ sizeRow, componentItem }: Props) {
    const form = useDykeForm();
    const itemData = componentItem.item.get.data();
    return (
        <TableCell className="hidden lg:table-cell">
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="sm" variant="outline">
                        <Money
                            value={
                                sizeRow
                                    ? sizeRow.overridePrice
                                        ? sizeRow.overridePrice
                                        : sum([
                                              sizeRow.jambSizePrice,
                                              sizeRow.componentsTotal,
                                          ])
                                    : componentItem.overridePrice
                                    ? componentItem.overridePrice
                                    : sum([
                                          componentItem.mouldingPrice,
                                          componentItem.componentsTotal,
                                      ])
                            }
                        />
                    </Button>
                </PopoverTrigger>
                <Form {...form}>
                    <PopoverContent className="max-w-[400px]">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                    Price Breakdown
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Price breakdown based on selected components
                                </p>
                            </div>
                            <div className="grid gap-2">
                                {itemData.item.formStepArray
                                    .filter((a) => a.item?.price)
                                    .map((a) => (
                                        <div
                                            key={a.step.id}
                                            className="border-b"
                                        >
                                            <div className="grid grid-cols-3  gap-2">
                                                <Label htmlFor="maxWidth">
                                                    {a.step.title}
                                                </Label>
                                                <div className="text-left col-span-2">
                                                    <Money
                                                        value={a.item.price}
                                                    />
                                                    <TableCol.Secondary>
                                                        {a.item.value}
                                                    </TableCol.Secondary>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {sizeRow && (
                                    <div>
                                        <div className="grid grid-cols-2 items-center gap-4">
                                            <Label htmlFor="maxWidth">
                                                Door Price
                                            </Label>
                                            <div className="text-left">
                                                <Money
                                                    value={
                                                        sizeRow.jambSizePrice
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-2 border-t">
                                    <ControlledInput
                                        control={form.control}
                                        label={"Edit Price"}
                                        type="number"
                                        name={
                                            sizeRow
                                                ? sizeRow.keys.overridePrice
                                                : componentItem.keys
                                                      .overridePrice
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Form>
            </Popover>
        </TableCell>
    );
}
