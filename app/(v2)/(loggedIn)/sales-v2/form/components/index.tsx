"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DykeItemFormSection } from "./dyke-item-form-section";
import { DykeForm, IDykeFormContext } from "../../type";
import { DykeFormContext } from "../../form-context";
import RenderForm from "@/_v2/components/common/render-form";
import { Button } from "@/components/ui/button";
import { addDoorUnitAction } from "../_action/add-door-unit";
import DykeBootstrap from "./dyke-bootstrap";
interface Props {
    defaultValues: any;
}
export default function SalesFormComponent({ defaultValues }: Props) {
    const form = useForm<DykeForm>({
        defaultValues: {
            ...defaultValues,
            currentItemIndex: 0,
            currentStepIndex: 0,
        },
    });
    const s: DykeForm = {} as any;

    // const [currentItemIndex, currentStepIndex] = form.watch([
    //     "currentItemIndex",
    //     "currentStepIndex",
    // ]);
    const [loadingStep, startLoadingStep] = useTransition();
    const itemArray = useFieldArray({
        control: form.control,
        name: "itemArray",
    });
    const ctxValue = {
        // currentItemIndex,
        startLoadingStep,
        loadingStep,
        // currentStepIndex,
        itemArray,
    } as IDykeFormContext;
    return (
        <DykeFormContext.Provider value={ctxValue}>
            <RenderForm {...form}>
                <DykeBootstrap />
                {itemArray.fields.map((field, index) => (
                    <DykeItemFormSection key={field.id} rowIndex={index} />
                ))}
                <div className="flex justify-end space-x-2 mt-2">
                    <Button
                        className=""
                        onClick={async () => {
                            const doorUnit = await addDoorUnitAction();
                            // doorUnit.item.form
                            // const lastIndex = itemArray.fields.length;
                            itemArray.append(doorUnit as any);
                            // form.setValue("currentStepIndex", 0);
                            // form.setValue("currentItemIndex", lastIndex);
                        }}
                    >
                        Add Door Unit
                    </Button>
                </div>
            </RenderForm>
        </DykeFormContext.Provider>
    );
}
