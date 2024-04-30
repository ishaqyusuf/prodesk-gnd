import { DykeItemStepSectionProps } from "../dyke-item-step-section";

import { cn, safeFormText } from "@/lib/utils";
import { useContext } from "react";
import { DykeItemFormContext } from "../../../_hooks/form-context";
import Image from "next/image";
import { env } from "@/env.mjs";
import { Label } from "@/components/ui/label";
import { getStepProduct } from "../../../_action/get-dyke-step-product";

import { Icons } from "@/components/_v1/icons";

import { Button } from "@/components/ui/button";

import useStepItems from "./use-step-items";
import { StepItem } from "./step-item";
export interface StepProductProps extends DykeItemStepSectionProps {
    rowIndex;
}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
export function StepProducts({
    stepForm,
    stepIndex,
    rowIndex,
}: StepProductProps) {
    const { stepProducts, openStepForm, isMultiSection, selectProduct, ctx } =
        useStepItems({
            stepForm,
            stepIndex,
            rowIndex,
        });

    return (
        <div className="">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stepProducts
                    .filter((p, i) => i < 20)
                    ?.map((b, i) => (
                        <div className="relative p-4 group" key={i}>
                            <div className=" hidden group-hover:flex absolute top-0 right-0  flex-col space-y-2 p-1 rounded-lg shadow-xl -m-2 bg-white z-10 border">
                                <Button
                                    size="icon"
                                    variant={"outline"}
                                    className="w-8 h-8"
                                    onClick={() => {
                                        openStepForm(b);
                                    }}
                                >
                                    <Icons.edit className="w-4 h-4" />
                                </Button>
                            </div>
                            <StepItem
                                isMultiSection={isMultiSection}
                                select={selectProduct}
                                loadingStep={ctx.loadingStep}
                                item={b}
                            />
                        </div>
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
        </div>
    );
}
