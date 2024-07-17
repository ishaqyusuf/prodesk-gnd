import { toast } from "sonner";
import { useDykeForm } from "./form-context";
import SelectDoorHeightsModal from "../components/modals/select-door-heights";
import { IStepProducts } from "../components/step-items-list/item-section/step-items";
import { generateRandomString, safeFormText } from "@/lib/utils";
import { useModal } from "@/components/common/modal/provider";
import { timeout } from "@/lib/timeout";

export function useMultiSelector(rowIndex, get) {
    const form = useDykeForm();
    const modal = useModal();
    const multi = {
        async initServices() {
            // const [uid, multiDyke, components] = form.getValues([
            //     `itemArray.${rowIndex}.multiComponent.uid`,
            //     `itemArray.${rowIndex}.multiComponent.multiDyke`,
            //     `itemArray.${rowIndex}.multiComponent.components`,
            // ]);
            // console.log([uid]);
            // if (!uid) {
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.uid`,
                generateRandomString(4)
            );
            form.setValue(
                `itemArray.${rowIndex}.multiComponent.multiDyke`,
                true
            );
            form.setValue(`itemArray.${rowIndex}.multiComponent.components`, {
                [generateRandomString(4)]: {
                    checked: true,
                    uid: generateRandomString(4),
                },
            } as any);
            await timeout(1000);
            // }
        },
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
                (b) => b?.checked
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
                .map(([k, v]) => v?.checked && k)
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
            const basePath =
                `itemArray.${rowIndex}.multiComponent.components.${safeTitle}` as any;
            const uid = form.getValues(`${basePath}.uid` as any);
            form.setValue(`${basePath}.toolId` as any, stepProd.dykeProductId);
            if (isMoulding)
                form.setValue(
                    `${basePath}.mouldingPrice` as any,
                    stepProd.product?.meta?.priced ? stepProd.product?.price : 0
                );
            if (!uid)
                form.setValue(
                    `${basePath}.uid` as any,
                    generateRandomString(4)
                );
            if (!currentState && !isMoulding) {
                modal.openModal(
                    <SelectDoorHeightsModal
                        form={form}
                        stepProd={stepProd}
                        productTitle={stepProd?.product?.title as any}
                        rowIndex={rowIndex}
                    />
                );
                return;
            }
            form.setValue(`${basePath}.checked` as any, !currentState);
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
