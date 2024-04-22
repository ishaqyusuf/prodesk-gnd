import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import HousePackageTool from "../house-package-tools/house-package-tool";
import { useContext, useEffect, useState } from "react";
import {
    DykeItemFormContext,
    useDykeCtx,
    useDykeForm,
} from "../../../form-context";
import { DykeDoorType, DykeForm, DykeStep } from "../../../type";
import ShelfItemIndex from "../shelf-item";
import Image from "next/image";
import { env } from "@/env.mjs";
import { Label } from "@/components/ui/label";
import {
    getMouldingStepProduct,
    getStepProduct,
} from "../../_action/get-dyke-step-product";
import { toast } from "sonner";
import { getNextDykeStepAction } from "../../_action/get-next-dyke-step";
import { Icons } from "@/components/_v1/icons";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
import Money from "@/components/_v1/money";
import { timeout } from "@/lib/timeout";
import { getDykeStepDoors } from "../../_action/get-dyke-step-doors";
import { doorQueryBuilder } from "../../../_utils/door-query-builder";

import SVG from "react-inlinesvg";
import { useModal } from "@/components/common/modal-old/provider";
import { Button } from "@/components/ui/button";
import EditStepItemModal from "../modals/edit-step-item-modal";
import { SaveStepProductExtra } from "../../_action/save-step-product";
import LineItemSection from "../line-item-section";
import { StepProducts } from "./item";
import MultiComponent from "../multi-component";
export interface DykeItemStepSectionProps {
    stepForm: DykeStep;
    stepIndex: number;
}
export function DykeItemStepSection({
    stepForm,
    stepIndex,
}: DykeItemStepSectionProps) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const stepValue = form.watch(
        `itemArray.${item.rowIndex}.item.formStepArray.${stepIndex}.item.value` as any
    );
    return (
        <Collapsible
            className={cn(stepForm?.item?.meta?.hidden && "hidden")}
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
                        <span className="font-semibold">
                            {stepForm?.step?.title}:
                        </span>
                        <span>{stepValue}</span>
                    </button>
                    <div className="px-2">
                        <Menu Icon={Icons.more}>
                            <MenuItem
                                SubMenu={
                                    <>
                                        <MenuItem>Before</MenuItem>
                                        <MenuItem>After</MenuItem>
                                    </>
                                }
                            >
                                New Step
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-8 border">
                {stepForm?.step?.title == "House Package Tool" ? (
                    // <HousePackageTool />
                    <MultiComponent Render={HousePackageTool} />
                ) : stepForm?.step?.title == "Shelf Items" ? (
                    <>
                        <ShelfItemIndex />
                    </>
                ) : stepForm?.step?.title == "Line Item" ? (
                    <>
                        <MultiComponent Render={LineItemSection} />
                        {/* <LineItemSection /> */}
                    </>
                ) : (
                    <StepProducts
                        stepForm={stepForm}
                        stepIndex={stepIndex}
                        rowIndex={item.rowIndex}
                    />
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
