import { toast } from "sonner";
import { useDykeForm } from "./form-context";
import SelectDoorHeightsModal from "../components/modals/select-door-heights";
import { IStepProducts } from "../components/step-items-list/step-items";
import { safeFormText } from "@/lib/utils";
import { useModal } from "@/components/common/modal/provider";

export function useMultiSelector(rowIndex, get) {
    const form = useDykeForm();
    const modal = useModal();
    const multi = {
        watchMultiComponent() {
            return form.watch(
                `itemArray.${rowIndex}.multiComponent.components`
            );
        },
        watchItemSelected(title): boolean {
            return form.watch(
                `itemArray.${rowIndex}.multiComponent.components.${title}.checked`
            );
        },
        validateMultiSelect(products: IStepProducts, stepFormTitle) {
            const items = form.getValues(
                `itemArray.${rowIndex}.multiComponent.components`
            );
            // console.log(items);
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
                checked.includes(safeFormText(p.product.title) as any)
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
            // form.setValue(
            //     `itemArray.${rowIndex}.multiComponent.rowIndex`,
            //     rowIndex
            // );
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.rowIndex`,
                rowIndex
            );
            return prod;
        },
        select(
            currentState,
            stepProd: IStepProducts[0],
            stepFormTitle,
            onSelect
        ) {
            const safeTitle = safeFormText(stepProd.product.title);
            const isMoulding = stepFormTitle == "Moulding";
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.components.${safeTitle}.toolId` as any,
                stepProd.dykeProductId
            );
            if (!currentState && !isMoulding) {
                modal.openModal(
                    <SelectDoorHeightsModal
                        form={form}
                        productTitle={stepProd?.product?.title as any}
                        rowIndex={rowIndex}
                    />
                );
                return;
            }
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.components.${safeTitle}.checked` as any,
                !currentState
            );

            // form.setValue(
            //     `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.height`,
            //     {} as any
            // );
        },
        isChecked(stepProd) {
            const safeTitle = safeFormText(stepProd.product.title);
            return form.getValues(
                `itemArray.${rowIndex}.multiComponent.components.${safeTitle}.checked`
            );
        },
    };
    return multi;
}
