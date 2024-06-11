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
export interface StepProductProps extends DykeItemStepSectionProps {
    rowIndex;
}
export type IStepProducts = Awaited<ReturnType<typeof getStepProduct>>;
export function StepProducts({
    stepForm,
    stepIndex,
    rowIndex,
}: StepProductProps) {
    const {
        stepProducts,
        openStepForm,
        isMultiSection,
        selectProduct,
        ctx,
        deleteStepItem,
        allowCustom,
        ...stepCtx
    } = useStepItems({
        stepForm,
        stepIndex,
        rowIndex,
    });
    return (
        <div className="">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stepProducts?.map((b, i) => (
                    <div className="relative p-4 group" key={i}>
                        <div className="hidden group-hover:flex absolute top-0 right-0  flex-col space-y-2 p-1 rounded-lg shadow-xl -m-2 bg-white z-10 border">
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
                            <ConfirmBtn
                                onClick={async () => {
                                    await deleteStepItem(i, b);
                                }}
                                size="icon"
                                Icon={Icons.trash}
                                trash
                            ></ConfirmBtn>
                        </div>
                        <StepItem
                            isMultiSection={isMultiSection}
                            select={selectProduct}
                            loadingStep={ctx.loadingStep}
                            item={b}
                            isRoot={stepCtx.isRoot}
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
                {allowCustom && (
                    <>
                        <CustomInput />
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
        </div>
    );
}
function CustomInput({}) {
    const inputForm = useForm({
        defaultValues: {
            value: "",
        },
    });
    return (
        <Form {...inputForm}>
            <div className="grid gap-2">
                <ControlledInput
                    name="value"
                    control={inputForm.control}
                    label="Custom"
                />
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => {}}>
                        Continue
                    </Button>
                </div>
            </div>
        </Form>
    );
}
