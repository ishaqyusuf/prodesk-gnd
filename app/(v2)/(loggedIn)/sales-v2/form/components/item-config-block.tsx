import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { Block, itemFormBlocks } from "../item-form-blocks";
interface Props {
    configIndex;
    block: Block;
    openBlock;
    setOpenBlock;
}
export function ItemConfigBlock({
    configIndex,
    block,
    openBlock,
    setOpenBlock,
}: Props) {
    return (
        <Collapsible
            open={configIndex == openBlock}
            onOpenChange={setOpenBlock}
            className="w-[350px] space-y-2"
        >
            <div className="flex justify-between">
                <CollapsibleTrigger>{block.title} </CollapsibleTrigger>
                <div className="flex items-center justify-between space-x-2">
                    {/* <Button className="p-0 h-6 w-6" variant={"destructive"}>
                        <Icons.Delete className="w-4 h-4" />
                    </Button> */}
                </div>
            </div>
            <CollapsibleContent className="">
                ads
                <div className="grid gap-4 grid-cols-4">
                    {block.options?.map((b, i) => (
                        <button key={i}>
                            <div className="">{b.title}</div>
                        </button>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
