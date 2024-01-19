import { useEffect } from "react";
import { useDykeForm } from "./form-context";
import { useFieldArray } from "react-hook-form";
import { createBlock } from "./form/item-form-blocks";
import { DykeBlock } from "./type";

// export interface IDykeItemFormContext {
//     blocks: DykeBlock[];
//     openedStepIndex: number;
//     nextBlock(value);
//     selectBlockValue(label, value);
//     openBlock(blockIndex);
//     configValueKey(title);
//     blocksKey: string;
//     rowIndex: string;
//     itemKey: string;
// }

export type IDykeItemFormContext = ReturnType<typeof useDykeItem>;
export default function useDykeItem(rowIndex: number) {
    const form = useDykeForm();
    const stepArrayName = `itemArray.${rowIndex}.item.formStepArray` as const;
    const itemKey = `items.${rowIndex}` as any;
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: stepArrayName,
    });
    const [opened, openedStepIndex] = form.watch([
        `itemArray.${rowIndex}.opened`,
        `itemArray.${rowIndex}.stepIndex`,
    ]);
    return {
        opened,
        openedStepIndex,
        toggleStep(stepIndex) {
            form.setValue(
                `itemArray.${rowIndex}.stepIndex`,
                stepIndex == openedStepIndex ? null : stepIndex
            );
        },
        openChange(val) {
            form.setValue(`itemArray.${rowIndex}.opened`, val);
        },
        formStepArray: fields,
        appendStep: append,
        removeStep: remove,
        rowIndex,
        itemKey,
        configValueKey(blockName) {
            return `items.${rowIndex}.meta.config.${blockName}` as any;
        },
        async nextBlock(value) {
            // console.log(value);
            // let block: any = null;
            // let blockIndex = openedStepIndex + 1;
            // if (value == "Shelf Items") {
            //     block = createBlock("Shelf Items", []);
            // } else {
            //     // next block
            // }
            // console.log(block);
            // if (!block) return;
            // form.setValue(blockIndexKey, blockIndex);
            // append(block);
        },
        async selectBlockValue(label, product) {
            // form.setValue(this.configValueKey(label), value);
            // await this.nextBlock(value);
        },
    };
}
