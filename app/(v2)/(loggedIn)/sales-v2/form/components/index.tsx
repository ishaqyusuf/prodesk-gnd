"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DykeItemFormSection } from "./step-items-list/item-section/item-section";
import { DykeForm, IDykeFormContext } from "../../type";
import { DykeFormContext } from "../_hooks/form-context";
import RenderForm from "@/_v2/components/common/render-form";
import { Button } from "@/components/ui/button";
import { addDoorUnitAction } from "../_action/add-door-unit";
import SalesMetaData from "./sales-meta-data";
import HeaderSection from "./header/header-section";
import SalesAddressSection from "../../../sales/edit/components/sales-address-section";
import { Icons } from "@/components/_v1/icons";
interface Props {
    defaultValues: any;
}
export default function SalesFormComponent({ defaultValues }: Props) {
    // console.log(defaultValues);

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
                <HeaderSection />
                {/* <DykeBootstrap /> */}
                <section
                    id="detailsSection"
                    className="border-y my-2 py-1 grid gap-4 md:grid-cols-2 xl:grid-cols-5 gap-x-8"
                >
                    <SalesMetaData />
                    <SalesAddressSection />
                </section>
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
                        <Icons.add className="w-4 h-4 mr-2" />
                        <span>Add Item</span>
                    </Button>
                </div>
            </RenderForm>
        </DykeFormContext.Provider>
    );
}
