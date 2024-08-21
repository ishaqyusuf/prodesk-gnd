import { DykeItemStepSectionProps } from "../../../item-section/components-section";

import { cn } from "@/lib/utils";

import { getStepProduct } from "../../../../_action/get-dyke-step-product";

import { Icons } from "@/components/_v1/icons";

import { Button } from "@/components/ui/button";

import useStepItems, { StepItemCtx } from "../../../../_hooks/use-step-items";
import { StepItem } from "./product";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { toast } from "sonner";
import { useEffect } from "react";
import { useIsVisible } from "@/hooks/use-is-visible";
import { motion } from "framer-motion";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { closestCorners } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { useModal } from "@/components/common/modal/provider";
import DeleteItemModal from "../../../modals/delete-item-modal";
import { useDykeForm } from "../../../../_hooks/form-context";
import {
    BatchSelectionAction,
    useProdBatchAction,
} from "../../../../_hooks/use-prod-batch-action";
export interface StepProductProps extends DykeItemStepSectionProps {
    rowIndex;
    stepProducts: IStepProducts;
    setStepProducts;
    allowAdd;
    allowCustom;
    sortMode?: boolean;
}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
export function StepProducts({
    stepForm,
    stepIndex,
    rowIndex,
    allowAdd,
    allowCustom,
    stepProducts,
    sortMode,
    setStepProducts,
}: StepProductProps) {
    const stepItemCtx = useStepItems({
        stepForm,
        stepProducts,
        setStepProducts,
        stepIndex,
        rowIndex,
    } as any);
    const {
        openStepForm,
        isMultiSection,
        selectProduct,
        ctx,
        // deleteStepItem,
        deleteStepItemModal,
        // allowCustom,
        ...stepCtx
    } = stepItemCtx;
    const form = useDykeForm();
    const { isVisible, elementRef } = useIsVisible({});
    useEffect(() => {
        setTimeout(() => {
            if (!isVisible && elementRef.current) {
                const offset = -150; // Adjust this value to your desired offset
                const elementPosition =
                    elementRef.current.getBoundingClientRect().top +
                    window.scrollY;
                const offsetPosition = elementPosition + offset;
                // elementRef.current.scrollIntoView({
                //     behavior: "smooth",
                //     block: "start",
                // });
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        }, 300);
    }, []);
    const modal = useModal();
    return (
        <StepItemCtx.Provider value={stepItemCtx}>
            <motion.div
                ref={elementRef}
                // initial={{ opacity: 0 }}
                // animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 1 }}
                style={{}}
            >
                <Sortable
                    orientation="mixed"
                    collisionDetection={closestCorners}
                    value={stepProducts}
                    onValueChange={setStepProducts}
                    overlay={
                        <div className="size-full rounded-md bg-primary/10" />
                    }
                >
                    {/* <Hider hide="dealer">
                    <Header />
                </Hider> */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                        {stepProducts
                            ?.filter((s) => !s.custom && !s._metaData?.hidden)
                            ?.map((item, i) => (
                                <SortableItem
                                    key={item.id}
                                    value={item.id}
                                    asTrigger={sortMode}
                                    asChild
                                >
                                    <Card className="border-none flex flex-col h-full bg-red-50">
                                        <StepItem
                                            className={cn(
                                                "relative border-muted-foreground/10  borno group",
                                                !sortMode &&
                                                    "hover:border-muted-foreground"
                                            )}
                                            stepForm={stepForm}
                                            isMultiSection={isMultiSection}
                                            select={selectProduct}
                                            loadingStep={ctx.loadingStep}
                                            item={item}
                                            deleteStepItem={() =>
                                                deleteStepItemModal([item])
                                            }
                                            setStepProducts={setStepProducts}
                                            openStepForm={openStepForm}
                                            isRoot={stepCtx.isRoot}
                                            stepIndex={stepIndex}
                                        />
                                    </Card>
                                </SortableItem>
                            ))}
                        {allowAdd && (
                            <div className="p-4">
                                <button
                                    onClick={() => {
                                        openStepForm();
                                    }}
                                    className={cn(
                                        "border hover:shadow-xl hover:bg-slate-200 rounded-lg flex flex-col justify-center items-center h-[200px] w-full"
                                    )}
                                >
                                    <Icons.add />
                                </button>
                            </div>
                        )}
                        {allowCustom && (
                            <>
                                <CustomInput
                                    currentValue={
                                        (stepForm.item.meta as any)?.custom
                                            ? stepForm.item.value
                                            : ""
                                    }
                                    onProceed={async (value) => {
                                        selectProduct(true, {
                                            custom: true,
                                            product: {
                                                title: value,
                                                meta: {
                                                    custom: true,
                                                },
                                            },
                                            dykeStepId: stepForm.step.id,
                                            _metaData: {
                                                price: 0,
                                            },
                                        } as any);
                                    }}
                                />
                            </>
                        )}
                    </div>
                </Sortable>

                {isMultiSection && (
                    <div className="flex justify-end">
                        <Button onClick={() => selectProduct(false)}>
                            Proceed
                        </Button>
                    </div>
                )}
                <div className="flex justify-center">
                    {ctx.loadingStep && (
                        <Icons.spinner className="h-8 w-8 animate-spin" />
                    )}
                </div>
            </motion.div>
            <BatchSelectionAction />
        </StepItemCtx.Provider>
    );
}
function CustomInput({ onProceed, currentValue }) {
    const inputForm = useForm({
        defaultValues: {
            value: currentValue,
        },
    });
    return (
        <Form {...inputForm}>
            <div className="flex ">
                <div className="flex flex-col gap-2">
                    <ControlledInput
                        name="value"
                        control={inputForm.control}
                        label="Custom"
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => {
                                const value = inputForm
                                    .getValues("value")
                                    ?.trim();
                                if (!value) toast.error("Invalid value");
                                else onProceed(value);
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </Form>
    );
}