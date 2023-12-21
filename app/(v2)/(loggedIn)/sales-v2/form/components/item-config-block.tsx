import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Block, getNextBlock } from "../item-form-blocks";
import { cn } from "@/lib/utils";
import HousePackageTool from "./house-package-tool";
import { useContext } from "react";
import { SalesFormContext } from "../sales-form-context";
import ShelfItemsBlock from "./shelf-items-block";
interface Props {
    // configIndex;
    block: Block;
    // openBlock;
    // setOpenBlock;
    blockIndex;
    // itemIndex;
    // nextBlock;
    // form;
}
export function ItemConfigBlock({ block, blockIndex }: Props) {
    const {
        configIndex,
        openBlock,
        rowIndex: itemIndex,
        setOpenBlock,
        nextBlock,
        form,
    } = useContext(SalesFormContext);
    const configky = `items.${itemIndex}.meta.config.${block.title}`;
    const blockValue = form.watch(configky as any);

    return (
        <Collapsible
            open={blockIndex == openBlock}
            onOpenChange={setOpenBlock}
            className={cn(!blockValue && blockIndex != openBlock && "hidden")}
        >
            <CollapsibleTrigger asChild>
                <button
                    className="flex bg-accent w-full p-2 px-4 border space-x-2"
                    onClick={(e) => {
                        e.preventDefault();
                        // console.log(blockIndex, openBlock);
                        // if (openBlock != blockIndex)
                        setOpenBlock(blockIndex);
                    }}
                >
                    <span className="font-semibold">{block.title}:</span>
                    <span>{blockValue}</span>
                </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="p-8 border">
                {block.title == "House Package Tool" && <HousePackageTool />}
                {block.title == "Shelf Items" && (
                    <>
                        <ShelfItemsBlock />
                    </>
                )}
                <div className="grid gap-4 grid-cols-4">
                    {block.options?.map((b, i) => (
                        <button
                            onClick={() => {
                                form.setValue(configky as any, b.title);
                                // setOpenBlock(openBlock + 1);
                                nextBlock(configky, b.title);
                            }}
                            key={i}
                        >
                            <div className="">{b.title}</div>
                        </button>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
