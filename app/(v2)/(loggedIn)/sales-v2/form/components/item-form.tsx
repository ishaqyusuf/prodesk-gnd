import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { itemFormBlocks } from "../item-form-blocks";
import { ItemConfigBlock } from "./item-config-block";
import { useState } from "react";

interface Props {
    rowIndex;
    openIndex;
    setOpen;
    form: UseFormReturn<any>;
}
export function SalesItemForm({ rowIndex, form, openIndex, setOpen }: Props) {
    const configIndex = form.watch(`items.${rowIndex}.meta.configIndex`);

    const [openBlock, setOpenBlock] = useState<any>(0);

    return (
        <Collapsible
            open={rowIndex == openIndex}
            onOpenChange={setOpen}
            className=""
        >
            <div className="flex bg-accent p-2 px-4 justify-between">
                <CollapsibleTrigger>Item {rowIndex}</CollapsibleTrigger>
                <div className="flex items-center justify-between space-x-2">
                    <Button className="p-0 h-6 w-6" variant={"destructive"}>
                        <Icons.Delete className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <CollapsibleContent className="">
                <div className="grid sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        {itemFormBlocks.map((block, bIndex) => (
                            <ItemConfigBlock
                                form={form}
                                block={block}
                                itemIndex={rowIndex}
                                blockIndex={bIndex}
                                openBlock={openBlock}
                                setOpenBlock={setOpenBlock}
                                key={bIndex}
                                configIndex={configIndex}
                            />
                        ))}
                    </div>
                    <div></div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
