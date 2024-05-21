"use client";

import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getDoorPrices } from "./get-price";
import { ServerPromiseType } from "@/types";
import Money from "@/components/_v1/money";
import { TableCol } from "@/components/common/data-table/table-cells";
import {
    UseMultiComponentItem,
    UseMultiComponentSizeRow,
} from "../../../../_hooks/use-multi-component-item";
import { useDykeForm } from "../../../../_hooks/form-context";

export interface ItemPriceFinderProps {
    dykeDoorId?;
    moldingId?;
    componentTitle?;
    casingId?;
    jambSizeId?;
    dimension?;
    componentItem?: UseMultiComponentItem;
    sizeRow?: UseMultiComponentSizeRow;
}
export default function ItemPriceFinder({
    componentItem,
    sizeRow,
    ...props
}: ItemPriceFinderProps) {
    const [open, setOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [priceChart, setPriceChart] =
        useState<ServerPromiseType<typeof getDoorPrices>["Response"]>();

    const form = useDykeForm();
    function selectPrice(priceIndex) {
        const priceTab = priceChart?.priceTabs[tabIndex];
        const price = priceTab?.priceList?.[priceIndex];
        // form.setValue

        form?.setValue(
            `${sizeRow?.sizeRootKey}.${priceTab?.priceKey}` as any,
            price?.value
        );
    }
    useEffect(() => {
        async function fetch() {
            const resp = await getDoorPrices(props as any);
            setPriceChart(resp);
            // console.log(resp);
            // priceChart.
        }
        fetch();
    }, []);
    return (
        <div>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        disabled={!priceChart?.hasPrice}
                        size={"icon"}
                        className="w-8 h-8"
                        variant={!priceChart?.hasPrice ? "ghost" : "outline"}
                    >
                        <Icons.dollar className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className="flex">
                        {priceChart?.priceTabs?.map((tab, i) => (
                            <Button
                                onClick={() => {
                                    setTabIndex(i);
                                }}
                                key={tab.title}
                                size={"sm"}
                                variant={tabIndex == i ? "default" : "ghost"}
                            >
                                {tab.title}
                            </Button>
                        ))}
                    </div>
                    <div className="mt-4 min-h-[100px] max-h-[250vh] overflow-auto">
                        {priceChart?.priceTabs?.[tabIndex]?.priceList?.map(
                            (price, priceIndex) => (
                                <Button
                                    onClick={() => selectPrice(priceIndex)}
                                    className="w-full flex"
                                    key={priceIndex}
                                    variant={"ghost"}
                                >
                                    <div className="flex flex-1 justify-between">
                                        <Money value={price.value} />
                                        <TableCol.Secondary>
                                            <TableCol.Date>
                                                {price.date}
                                            </TableCol.Date>
                                        </TableCol.Secondary>
                                    </div>
                                </Button>
                            )
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
