"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DykeForm, IDykeFormContext } from "../../type";
import { DykeFormContext } from "../_hooks/form-context";
import RenderForm from "@/_v2/components/common/render-form";
import { Button } from "@/components/ui/button";
import { addDoorUnitAction } from "../_action/add-door-unit";
import SalesMetaData from "./sales-meta-data";
import HeaderSection from "./dyke-sales-header-section";
import SalesAddressSection from "../../../sales/edit/components/sales-address-section";
import { Icons } from "@/components/_v1/icons";
import DykeSalesFooterSection from "./dyke-sales-footer-section";
import { DykeInvoiceItemSection } from "./item-section/item-section";

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

    const [components, dealerMode, status, superAdmin] = form.watch([
        "itemArray.1.multiComponent.components",
        "dealerMode",
        "status",
        "superAdmin",
    ]);
    const s: DykeForm = {} as any;

    const [loadingStep, startLoadingStep] = useTransition();
    const itemArray = useFieldArray({
        control: form.control,
        name: "itemArray",
    });

    const ctxValue = {
        startLoadingStep,
        loadingStep,
        itemArray,
        dealerMode,
        superAdmin,
        status,
    } as IDykeFormContext;

    return (
        <DykeFormContext.Provider value={ctxValue}>
            <RenderForm {...form}>
                <HeaderSection />
                <section
                    id="detailsSection"
                    className="border-y my-2 py-1 grid gap-4 md:grid-cols-2 xl:grid-cols-5 gap-x-8"
                >
                    {!dealerMode && <SalesMetaData />}
                    <SalesAddressSection />
                </section>
                {itemArray.fields.map((field, index) => (
                    <DykeInvoiceItemSection
                        itemArray={itemArray}
                        key={field.id}
                        rowIndex={index}
                    />
                ))}
                <div className="flex justify-end space-x-2 mt-2">
                    <Button
                        className=""
                        onClick={async () => {
                            const doorUnit = await addDoorUnitAction();
                            itemArray.append(doorUnit as any);
                        }}
                    >
                        <Icons.add className="w-4 h-4 mr-2" />
                        <span>Add Item</span>
                    </Button>
                </div>
                <DykeSalesFooterSection />
            </RenderForm>
        </DykeFormContext.Provider>
    );
}
