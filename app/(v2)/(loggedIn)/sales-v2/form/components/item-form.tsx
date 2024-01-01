import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { getNextBlock, itemFormBlocks } from "../item-form-blocks";
import { ItemConfigBlock } from "./item-config-block";
import { useEffect, useState } from "react";
import { SalesFormContext } from "../sales-form-context";

interface Props {
    rowIndex;
    openIndex;
    setOpen;
    form: UseFormReturn<any>;
}
export function SalesItemForm({ rowIndex, form, openIndex, setOpen }: Props) {
    const configIndex = form.watch(`items.${rowIndex}.meta.configIndex`);

    const [openBlock, setOpenBlock] = useState<any>(-1);
    const [blocks, setBlocks] = useState([]);
    const ctx = {
        openBlock,
        setOpenBlock,
        blocks,
        setBlocks,
        rowIndex,
        openIndex,
        setOpen,
        configIndex,
        form,
        nextBlock: (label, value) => {
            getNextBlock({
                setBlocks,
                openBlock,
                setOpenBlock,
                label,
                value,
            });
        },
    };
    useEffect(() => {
        getNextBlock({ setBlocks, openBlock, setOpenBlock });
    }, []);
    return (
        <SalesFormContext.Provider value={ctx}>
            <Collapsible
                open={rowIndex == openIndex}
                onOpenChange={setOpen}
                className=""
            >
                <div className="flex bg-accent p-2 px-4 justify-between">
                    <CollapsibleTrigger>
                        Item {Number(rowIndex) + 1}
                    </CollapsibleTrigger>
                    <div className="flex items-center justify-between space-x-2">
                        <Button className="p-0 h-6 w-6" variant={"destructive"}>
                            <Icons.Delete className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <CollapsibleContent className="">
                    <div className="grid sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            {blocks.map((block, bIndex) => (
                                <ItemConfigBlock
                                    // form={form}
                                    block={block}
                                    blockIndex={bIndex}
                                    key={bIndex}
                                />
                            ))}
                        </div>
                        <div></div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </SalesFormContext.Provider>
    );
}
