import { useEffect } from "react";
import { useDykeForm } from "./form-context";
import { useFieldArray } from "react-hook-form";
import { createBlock } from "./form/item-form-blocks";
import { DykeBlock, DykeDoorType, DykeForm, FormStepArray } from "./type";
import { IStepProducts } from "./form/components/step-items-list/item";
import { useModal } from "@/components/common/modal/provider";
import SelectDoorHeightsModal from "./form/components/modals/select-door-heights";
import { toast } from "sonner";

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
    const itemKey = `itemArray.${rowIndex}.item` as any;
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: stepArrayName,
    });
    const [opened, openedStepIndex] = form.watch([
        `itemArray.${rowIndex}.opened`,
        `itemArray.${rowIndex}.stepIndex`,
    ]);
    function getFormStepArray(): FormStepArray {
        return form.getValues(
            `itemArray.${rowIndex}.item.formStepArray` as any
        );
    }
    function doorType(): DykeDoorType {
        return form.getValues(`${itemKey}.housePackageTool.doorType` as any);
    }
    const get = {
        itemArray: (): DykeForm["itemArray"][0] =>
            form.getValues(`itemArray.${rowIndex}` as any),
        data: (): FormStepArray[0] => form.getValues(`${itemKey}` as any),
        getFormStepArray,
        doorType,
        getMouldingSpecie() {
            const formSteps = getFormStepArray();
            const s = formSteps.find((fs) => fs.step?.title == "Specie");
            return s?.item?.value;
        },
        packageToolId: (k: "dykeDoor" | "molding") =>
            form.getValues(
                `itemArray.${rowIndex}.item.housePackageTool.${k}}Id` as any
            ),
    };
    const modal = useModal();
    const multi = {
        watchMultiComponent() {
            return form.watch(`itemArray.${rowIndex}.multiComponent`);
        },
        watchItemSelected(title): boolean {
            return form.watch(
                `itemArray.${rowIndex}.multiComponent.${title}.checked`
            );
        },
        validateMultiSelect(products: IStepProducts, stepFormTitle) {
            const items = form.getValues(
                `itemArray.${rowIndex}.multiComponent`
            );
            const checkedItems = Object.values(items || {}).filter(
                (b) => b.checked
            );
            const isMoulding = stepFormTitle == "Moulding";
            const pkdId = get.packageToolId(
                isMoulding ? "molding" : "dykeDoor"
            );
            // console.log(items);

            if (!checkedItems.length) {
                toast.error("Select atleast one item to proceed");
                return false;
            }
            const checked = Object.entries(items)
                .map(([k, v]) => v.checked && k)
                .filter(Boolean);
            const prods = products.filter((p) =>
                checked.includes(p.product.title as any)
            );
            let prod = prods[0];
            if (pkdId) {
                let stillChecked = prods.find((p) => p.dykeProductId == pkdId);
                if (stillChecked) prod = stillChecked;
                form.setValue(
                    `itemArray.${rowIndex}.stillChecked`,
                    stillChecked != null
                );
            }
            return prod;
        },
        select(
            currentState,
            stepProd: IStepProducts[0],
            stepFormTitle,
            onSelect
        ) {
            const isMoulding = stepFormTitle == "Moulding";
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.toolId`,
                stepProd.dykeProductId
            );
            if (!currentState && !isMoulding) {
                modal.openModal(
                    <SelectDoorHeightsModal
                        form={form}
                        stepProd={stepProd}
                        rowIndex={rowIndex}
                    />
                );
                return;
            }
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.checked`,
                !currentState
            );

            // form.setValue(
            //     `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.height`,
            //     {} as any
            // );
        },
        isChecked(stepProd) {
            return form.getValues(
                `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.checked`
            );
        },
    };
    return {
        multi,
        get,
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

        // doorType(): DykeDoorType {
        //     return form.getValues(
        //         `${itemKey}.housePackageTool.doorType` as any
        //     );
        // },
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
