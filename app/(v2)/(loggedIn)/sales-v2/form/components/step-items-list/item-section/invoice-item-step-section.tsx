import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { useDykeForm, useDykeItemCtx } from "../../../_hooks/form-context";
import { DykeStep } from "../../../../type";
import ShelfItemIndex from "./shelf-item";

import LineItemSection from "./multi-item-tab/line-item-section/line-item-section";
import { IStepProducts, StepProducts } from "./step-items";
import MultiComponentRender from "./multi-item-tab/multi-component-render";
import HousePackageTool from "./multi-item-tab/house-package-tools";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import { Icons } from "@/components/_v1/icons";
import { useModal } from "@/components/common/modal/provider";
import { useEffect, useState } from "react";
import EditStepComponentPrice from "../../modals/edit-step-component-price";
import PricingDependenciesModal from "../../modals/pricing-dependecies";
import { Button } from "@/components/ui/button";
import { sortComponents } from "../../../_action/sort-components";
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
    const stepValue = form.watch(
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value` as any
    );
    const modal = useModal();

    const [stepProducts, setStepProducts] = useState<IStepProducts>([]);

    function pricingCondition() {
        modal.openModal(
            <PricingDependenciesModal
                stepIndex={stepIndex}
                rowIndex={item.rowIndex}
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
                const data = (prod as any)?.isDoor
                    ? {
                          meta: {
                              ...(prod?.product?.meta || {}),
                              sortIndex: index,
                          },
                      }
                    : { sortIndex: index };
                return {
                    id: prod.id,
                    data,
                };
            })
        );
        await toast.success("Saved.");
    };
    return (
        <Collapsible
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
                        className="flex  w-full p-2 px-4 border space-x-2"
                        onClick={(e) => {
                            e.preventDefault();
                            if (stepForm?.item?.meta?.hidden) return;
                            item.toggleStep(stepIndex);
                        }}
                    >
                        <DevOnly>{stepForm.step.id} </DevOnly>
                        <span className="font-semibold">
                            {stepForm?.step?.title}:
                        </span>
                        <span>{stepValue}</span>
                    </button>
                    <div className="px-2">
                        <Menu Icon={Icons.more}>
                            <MenuItem onClick={pricingCondition}>
                                Pricing Dependencies
                            </MenuItem>
                            <MenuItem onClick={componentPrice}>
                                Component Price
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
