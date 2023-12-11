import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Block } from "../item-form-blocks";
import { cn } from "@/lib/utils";
import HousePackageTool from "./house-package-tool";
interface Props {
    configIndex;
    block: Block;
    openBlock;
    setOpenBlock;
    blockIndex;
    itemIndex;
    form;
}
export function ItemConfigBlock({
    configIndex,
    block,
    openBlock,
    itemIndex,
    setOpenBlock,
    blockIndex,
    form,
}: Props) {
    const configky = `items.${itemIndex}.meta.config.${block.title}`;
    const blockValue = form.watch(configky);

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
                <div className="grid gap-4 grid-cols-4">
                    {block.options?.map((b, i) => (
                        <button
                            onClick={() => {
                                form.setValue(configky, b.title);
                                setOpenBlock(openBlock + 1);
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
