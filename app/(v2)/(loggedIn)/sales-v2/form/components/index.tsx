"use client";

import { useEffect, useTransition } from "react";
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
import { DykeInvoiceItemSection } from "./step-items-list/item-section/invoice-item-section";
import DevOnly from "@/_v2/components/common/dev-only";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setStepsUids } from "../_action/bootstraps/set-step-uids";
interface Props {
    defaultValues: any;
}
export default function SalesFormComponent({ defaultValues }: Props) {
    useEffect(() => {
        console.log(defaultValues);
    }, []);
    const form = useForm<DykeForm>({
        defaultValues: {
            ...defaultValues,
            currentItemIndex: 0,
            currentStepIndex: 0,
        },
    });
    const components = form.watch("itemArray.1.multiComponent.components");
    const s: DykeForm = {} as any;
    useEffect(() => {
        console.log({ components });
    }, [components]);
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
            {/* <div className="fixed bg-emerald-950 text-white right-0 h-[45vh] w-1/4 p-2 text-muted  bottom-0 left-[1/2]">
                <ScrollArea>
                    <DevOnly>{JSON.stringify(components)}</DevOnly>
                </ScrollArea>
            </div> */}
            <DevOnly>
                <Button
                    onClick={async () => {
                        console.log(await setStepsUids());
                    }}
                >
                    Bootstrap uids
                </Button>
            </DevOnly>
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
