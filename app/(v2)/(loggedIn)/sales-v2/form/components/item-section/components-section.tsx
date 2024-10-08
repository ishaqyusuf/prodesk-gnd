import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    useDykeCtx,
    useDykeForm,
    useDykeItemCtx,
} from "../../_hooks/form-context";
import { DykeStep, DykeStepMeta } from "../../../type";
import ShelfItemIndex from "../step-items-list/item-section/shelf-item";

import LineItemSection from "../step-items-list/item-section/multi-item-tab/line-item-section/line-item-section";
import {
    IStepProducts,
    StepProducts,
} from "../step-items-list/item-section/step-products";
import MultiComponentRender from "../step-items-list/item-section/multi-item-tab/multi-component-render";
import HousePackageTool from "../step-items-list/item-section/multi-item-tab/house-package-tools";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";
import { useModal } from "@/components/common/modal/provider";
import { useState } from "react";
import EditStepComponentPrice from "../modals/edit-step-component-price";
import PricingDependenciesModal from "../modals/pricing-dependecies";
import { Button } from "@/components/ui/button";
import { sortComponents } from "../../_action/sort-components";

import { updateDykeStepMeta } from "../../_action/dyke-step-setting";
import RestoreComponentModal from "../modals/restore-component";
import {
    getDykeStepState,
    getFormSteps,
} from "../step-items-list/item-section/step-products/init-step-components";
import { toast } from "sonner";
import DevOnly from "@/_v2/components/common/dev-only";
export interface DykeItemStepSectionProps {
    stepForm: DykeStep;
    stepIndex: number;
}
export function DykeInvoiceItemStepSection({
    stepForm,
    stepIndex,
}: DykeItemStepSectionProps) {
    const form = useDykeForm();
    const item = useDykeItemCtx();

    const [stepValue, allowAdd, allowCustom] = form.watch([
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value`,
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.step.meta.allowAdd`,
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.step.meta.allowCustom`,
    ] as any);
    const modal = useModal();
    const ctx = useDykeCtx();
    const [stepProducts, setStepProducts] = useState<IStepProducts>([]);
    function restoreComponent() {
        const formArray = form.getValues(
            `itemArray.${item.rowIndex}.item.formStepArray`
        );
        const _depFormSteps = getFormSteps(formArray, stepIndex);
        const stateDeps = getDykeStepState(_depFormSteps, stepForm);
        let k = stateDeps.slice(-1)[0]?.key;
        if (!k) {
            toast("Cannot restore for this section");
            return;
        }
        modal.openModal(
            <RestoreComponentModal
                k={k}
                setStepProducts={setStepProducts}
                products={stepProducts}
            />
        );
    }
    function conditionSettings(settingKey: keyof DykeStepMeta) {
        modal.openModal(
            <PricingDependenciesModal
                stepIndex={stepIndex}
                rowIndex={item.rowIndex}
                settingKey={settingKey}
                stepForm={stepForm}
                form={form}
                setStepProducts={setStepProducts}
                stepProducts={stepProducts}
            />
        );
    }
    function componentPrice() {
        modal.openModal(
            <EditStepComponentPrice
                rowIndex={item.rowIndex}
                baseForm={form}
                stepProducts={stepProducts}
            />
        );
    }
    const [sortMode, setSortMode] = useState(false);
    const finishSort = async () => {
        setSortMode(false);
        await sortComponents(
            stepProducts.map((prod, index) => {
                const data = { sortIndex: index };
                return {
                    id: prod.id,
                    data,
                };
            })
        );
    };
    async function toggleStepSetting(key: keyof typeof stepForm.step.meta) {
        const meta = stepForm.step.meta || {};
        const state = ((meta as any)[key] = !meta[key]);
        await updateDykeStepMeta(stepForm.step.id, meta);
        form.setValue(
            `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.step.meta.${key}` as any,
            state
        );
    }
    return (
        <Collapsible
            id={stepForm.step.title}
            data-value={stepForm.item?.value}
            className={cn(
                stepForm?.item?.meta?.hidden && "hidden",
                !item.expanded &&
                    ![
                        "Item Type",
                        "House Package Tool",
                        "Line Item",
                        "Shelf Items",
                    ].includes(stepForm.step?.title as any) &&
                    "hidden"
            )}
            open={stepIndex == item.openedStepIndex}
            // onOpenChange={() => item.openBlock(stepIndex)}
        >
            <CollapsibleTrigger asChild>
                <div className="flex bg-accent">
                    <button
                        className="flex  w-full p-1 px-4 border space-x-2"
                        onClick={(e) => {
                            e.preventDefault();
                            if (stepForm?.item?.meta?.hidden) return;
                            item.toggleStep(stepIndex);
                        }}
                    >
                        <span className="font-semibold">
                            {stepForm?.step?.title}:
                        </span>
                        <span>{stepValue}</span>
                        <DevOnly>
                            <span>
                                {stepForm?.step?.id}-{stepForm?.step.uid}
                            </span>
                        </DevOnly>
                    </button>
                    <div className={cn("px-2", !ctx.superAdmin && "hidden")}>
                        <Menu Icon={Icons.more}>
                            <MenuItem
                                onClick={() =>
                                    conditionSettings("priceDepencies")
                                }
                            >
                                Pricing Deps
                            </MenuItem>
                            <MenuItem
                                onClick={() => conditionSettings("stateDeps")}
                            >
                                Component Deps
                            </MenuItem>
                            <MenuItem onClick={restoreComponent}>
                                Restore Component
                            </MenuItem>
                            <MenuItem
                                onClick={
                                    sortMode
                                        ? finishSort
                                        : () => setSortMode(true)
                                }
                            >
                                {sortMode ? "Finish Sort" : "Sort"}
                            </MenuItem>
                            <MenuItem
                                onClick={() => toggleStepSetting("allowCustom")}
                            >
                                {allowCustom ? "Disable " : "Enable "}
                                Custom
                            </MenuItem>
                            <MenuItem
                                onClick={() => toggleStepSetting("allowAdd")}
                            >
                                {allowAdd ? "Disable " : "Enable "}
                                Add
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-8 border ">
                {stepForm?.step?.title == "House Package Tool" ? (
                    // <HousePackageTool />
                    <>
                        <MultiComponentRender Render={HousePackageTool} />
                    </>
                ) : stepForm?.step?.title == "Shelf Items" ? (
                    <>
                        <ShelfItemIndex />
                    </>
                ) : stepForm?.step?.title == "Line Item" ? (
                    <>
                        <MultiComponentRender line Render={LineItemSection} />
                    </>
                ) : (
                    <StepProducts
                        allowAdd={allowAdd}
                        allowCustom={allowCustom}
                        stepForm={stepForm}
                        stepIndex={stepIndex}
                        rowIndex={item.rowIndex}
                        sortMode={sortMode}
                        stepProducts={stepProducts}
                        setStepProducts={setStepProducts}
                    />
                )}
                {sortMode && (
                    <div className="fixed shadow-xl  z-10 mb-16 bottom-0 left-1/2">
                        <Button onClick={finishSort} size="sm">
                            Finish Sort
                        </Button>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
