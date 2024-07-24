import { DykeItemStepSectionProps } from "../invoice-item-step-section";

import { cn } from "@/lib/utils";

import { getStepProduct } from "../../../../_action/get-dyke-step-product";

import { Icons } from "@/components/_v1/icons";

import { Button } from "@/components/ui/button";

import useStepItems from "./use-step-items";
import { StepItem } from "./step-item";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { toast } from "sonner";
import { useEffect } from "react";
import { useIsVisible } from "@/hooks/use-is-visible";
import { motion } from "framer-motion";
import {
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";
export interface StepProductProps extends DykeItemStepSectionProps {
    rowIndex;
    stepProducts: IStepProducts;
    setStepProducts;
}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
export function StepProducts({
    stepForm,
    stepIndex,
    rowIndex,
    stepProducts,
    setStepProducts,
}: StepProductProps) {
    const {
        openStepForm,
        isMultiSection,
        selectProduct,
        ctx,
        deleteStepItem,
        allowCustom,
        ...stepCtx
    } = useStepItems({
        stepForm,
        stepProducts,
        setStepProducts,
        stepIndex,
        rowIndex,
    });
    const { isVisible, elementRef } = useIsVisible({});
    useEffect(() => {
        console.log(isVisible);
        setTimeout(() => {
            if (!isVisible && elementRef.current) {
                const offset = -150; // Adjust this value to your desired offset
                const elementPosition =
                    elementRef.current.getBoundingClientRect().top +
                    window.scrollY;
                // console.log({ elementPosition });

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
    // useEffect(() => {},[])
    return (
        <motion.div
            ref={elementRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1 }}
            style={{}}
        >
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stepProducts?.map((b, i) => (
                    <StepItem
                        key={b.uid}
                        stepForm={stepForm}
                        isMultiSection={isMultiSection}
                        select={selectProduct}
                        loadingStep={ctx.loadingStep}
                        item={b}
                        deleteStepItem={async () => {
                            await deleteStepItem(i, b);
                        }}
                        setStepProducts={setStepProducts}
                        openStepForm={openStepForm}
                        isRoot={stepCtx.isRoot}
                        stepIndex={stepIndex}
                    />
                ))}
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
                {allowCustom && (
                    <>
                        <CustomInput
                            currentValue={stepForm.item.value}
                            onProceed={async (value) => {
                                selectProduct(
                                    true,
                                    {
                                        product: {
                                            title: value,
                                            meta: {
                                                custom: true,
                                            },
                                        },
                                        dykeStepId: stepForm.step.id,
                                        _estimate: {
                                            price: 0,
                                        },
                                    } as any,
                                    true
                                );
                            }}
                        />
                    </>
                )}
            </div>

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
            <div className="flex">
                <div className="grid gap-2">
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
