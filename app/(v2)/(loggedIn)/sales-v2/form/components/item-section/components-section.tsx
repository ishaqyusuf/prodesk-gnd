import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, generateRandomString } from "@/lib/utils";
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
import { _modal } from "@/components/common/modal/provider";
import { useState } from "react";
import EditStepComponentPrice from "../modals/edit-step-component-price";
import DependenciesModal from "../../../../../../(clean-code)/(sales)/sales-book/(form)/_components/modals/deps-modal";
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
import { useLegacyDykeFormStep } from "@/app/(clean-code)/(sales)/sales-book/(form)/_hooks/legacy-hooks";

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
    const [stepValue] = form.watch([
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value`,
    ] as any);
    const ctx = useDykeCtx();
    const stepActionNodeId = `${item.rowIndex}-${stepIndex}`;

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
                    <div className="" id={stepActionNodeId}></div>
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
                        stepActionNodeId={stepActionNodeId}
                        stepForm={stepForm}
                        stepIndex={stepIndex}
                    />
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
