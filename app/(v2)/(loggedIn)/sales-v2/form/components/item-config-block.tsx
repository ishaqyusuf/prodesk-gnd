import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import HousePackageTool from "./house-package-tool";
import { useContext } from "react";
import ShelfItemsBlock from "./shelf-item/shelf-items-block";
import { DykeItemFormContext, useDykeForm } from "../../form-context";
import { DykeBlock } from "../../type";
import ShelfItemIndex from "./shelf-item";
interface Props {
    block: DykeBlock;
    blockIndex: number;
}
export function ItemConfigBlock({ block, blockIndex }: Props) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const blockValue = form.watch(item.configValueKey(block.title));
    return (
        <Collapsible
            open={blockIndex == item.openedBlockIndex}
            onOpenChange={() => item.openBlock(blockIndex)}
            className={cn(
                !blockValue && blockIndex != item.openedBlockIndex && "hidden"
            )}
        >
            <CollapsibleTrigger asChild>
                <button
                    className="flex bg-accent w-full p-2 px-4 border space-x-2"
                    onClick={(e) => {
                        e.preventDefault();
                        // console.log(blockIndex, openBlock);
                        // if (openBlock != blockIndex)
                        // setOpenBlock(blockIndex);
                        item.openBlock(blockIndex);
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
                        <ShelfItemIndex />
                    </>
                )}
                <div className="grid gap-4 grid-cols-4">
                    {block.options?.map((b, i) => (
                        <button
                            onClick={() => {
                                item.selectBlockValue(block.title, b.title);
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
