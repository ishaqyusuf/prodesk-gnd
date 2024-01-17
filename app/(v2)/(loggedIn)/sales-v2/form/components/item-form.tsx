import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { ItemConfigBlock } from "./item-config-block";
import { useContext, useEffect, useState } from "react";
import {
    DykeFormContext,
    DykeItemFormContext,
    useDykeForm,
} from "../../form-context";
import useDykeItem, { IDykeItemFormContext } from "../../use-dyke-item";
import { Label } from "@/components/ui/label";

interface Props {
    rowIndex;
    openIndex;
    setOpen;
    form: UseFormReturn<any>;
}
export function SalesItemForm({ rowIndex }: Props) {
    const form = useDykeForm();
    // const configIndex = form.watch(`items.${rowIndex}.meta.configIndex`);

    const item = useDykeItem(rowIndex);
    const dykeCtx = useContext(DykeFormContext);
    const ctx = {
        ...item,
    } as IDykeItemFormContext;
    return (
        <DykeItemFormContext.Provider value={ctx}>
            <Collapsible
                open={rowIndex == dykeCtx.currentItemIndex}
                onOpenChange={() => dykeCtx.setOpened(rowIndex)}
                className=""
            >
                <div className="flex bg-accent p-2 px-4 justify-between">
                    <CollapsibleTrigger>
                        <Label className="text-base">
                            Item {Number(rowIndex) + 1}
                        </Label>
                    </CollapsibleTrigger>
                    <div className="flex items-center justify-between space-x-2">
                        <Button className="p-0 h-6 w-6" variant={"destructive"}>
                            <Icons.trash className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <CollapsibleContent className="">
                    <div className="grid sm:grid-cols-3">
                        <div className="sm:col-span-3">
                            {item.blocks.map((block, bIndex) => (
                                <ItemConfigBlock
                                    block={block}
                                    blockIndex={bIndex}
                                    key={bIndex}
                                />
                            ))}
                        </div>
                        {/* <div></div> */}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </DykeItemFormContext.Provider>
    );
}
