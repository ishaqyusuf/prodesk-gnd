import { useEffect } from "react";
import { useDykeForm } from "./form-context";
import { useFieldArray } from "react-hook-form";
import { createBlock } from "./form/item-form-blocks";
import { DykeBlock } from "./type";

// export interface IDykeItemFormContext {
//     blocks: DykeBlock[];
//     openedBlockIndex: number;
//     nextBlock(value);
//     selectBlockValue(label, value);
//     openBlock(blockIndex);
//     configValueKey(title);
//     blocksKey: string;
//     rowIndex: string;
//     itemKey: string;
// }

export type IDykeItemFormContext = ReturnType<typeof useDykeItem>;
export default function useDykeItem(rowIndex: string) {
    const form = useDykeForm();
    const blockIndexKey = `itemBlocks.${rowIndex}.openedBlockIndex` as any;
    const blocksKey = `itemBlocks.${rowIndex}.blocks` as any;
    const itemKey = `items.${rowIndex}` as any;
    const [openedBlockIndex] = form.watch([blockIndexKey]);
    const { fields, append } = useFieldArray({
        control: form.control,
        name: blocksKey,
    });

    return {
        blocks: fields as any,
        rowIndex,
        openedBlockIndex,
        blocksKey,
        itemKey,
        configValueKey(blockName) {
            return `items.${rowIndex}.meta.config.${blockName}` as any;
        },
        openBlock(blockIndex) {
            form.setValue(blockIndexKey, blockIndex);
        },
        async nextBlock(value) {
            console.log(value);

            let block: any = null;
            let blockIndex = openedBlockIndex + 1;
            if (value == "Shelf Items") {
                block = createBlock("Shelf Items", []);
            } else {
                // next block
            }
            console.log(block);
            if (!block) return;
            form.setValue(blockIndexKey, blockIndex);
            append(block);
        },
        async selectBlockValue(label, value) {
            form.setValue(this.configValueKey(label), value);
            await this.nextBlock(value);
        },
    };
}
