"use  client";

import Modal from "@/components/common/modal";
import {
    useFieldArray,
    useForm,
    useFormContext,
    UseFormReturn,
} from "react-hook-form";
import { DykeForm, DykeStep } from "../../../../type";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { useEffect, useState } from "react";
import { getStepProduct } from "../../../_action/get-dyke-step-product";
import { savePriceConditionAction } from "./action";
import calculateComponentPrice from "../../step-items-list/item-section/step-items/calculate-component-price";
import { useModal } from "@/components/common/modal/provider";

interface Props {
    form: UseFormReturn<DykeForm>;
    stepForm: DykeStep;
    stepIndex;
    rowIndex;
    stepProducts;
    setStepProducts;
}
export default function PriceConditionModal({
    form,
    stepForm,
    stepIndex,
    rowIndex,
    stepProducts,
    setStepProducts,
}: Props) {
    const stepArray = form.getValues(
        `itemArray.${rowIndex}.item.formStepArray`
    );
    const steps = stepArray.filter(
        (_, i) =>
            i < stepIndex &&
            !_.item.meta.hidden &&
            ["Door", "Moulding"].every((s) => s != _.step.title)
    );

    const _form = useForm({
        defaultValues: {
            ...stepForm.step.meta,
        },
    });
    const formArray = useFieldArray({
        control: _form.control,
        name: "priceConditions",
        keyName: "_id",
    });
    async function save() {
        const _ = await savePriceConditionAction(
            stepForm.step.id,
            _form.getValues()
        );
        stepForm.step.meta = _form.getValues();

        form.setValue(
            `itemArray.${rowIndex}.item.formStepArray.${stepIndex}` as any,
            stepForm
        );
        setStepProducts(
            calculateComponentPrice({
                stepForm,
                stepProducts,
                stepIndex,
                stepArray,
            })
        );
        console.log(_);
        modal.close();
    }
    const modal = useModal();
    return (
        <Form {..._form}>
            <Modal.Content size="lg">
                <Modal.Header
                    title={`Price Condition`}
                    subtitle={stepForm.step.title}
                />
                {formArray.fields.map((field, conditionIndex) => {
                    return (
                        <div key={field._id} className="flex">
                            <div className="w-8 text-sm mt-8">
                                {conditionIndex + 1}.
                            </div>
                            <div className="flex-1 items-end grid grid-cols-2 gap-2">
                                <ControlledInput
                                    control={_form.control}
                                    name={`priceConditions.${conditionIndex}.formula`}
                                    size="sm"
                                    label="Price Evaluation"
                                    placeholder="eg; basePrice * 2.3"
                                />
                                <Rules
                                    steps={steps as any}
                                    conditionIndex={conditionIndex}
                                />
                            </div>
                        </div>
                    );
                })}
                <div className="">
                    <Button
                        onClick={() => {
                            formArray.append({
                                formula: "",
                                rules: [{}],
                            });
                        }}
                        className="w-full"
                        size="sm"
                    >
                        <Icons.add className="w-4 h-4 mr-2" />
                        Create Condition
                    </Button>
                </div>
                <Modal.Footer submitText="save" onSubmit={save} />
            </Modal.Content>
        </Form>
    );
}
interface RulesProps {
    conditionIndex;
    steps: DykeStep[];
}
function Rules({ conditionIndex, steps }: RulesProps) {
    const form: UseFormReturn<DykeStep["step"]["meta"]> = useFormContext();
    const rulesArray = useFieldArray({
        control: form.control,
        name: `priceConditions.${conditionIndex}.rules`,
        keyName: "_id",
    });
    return (
        <>
            {rulesArray.fields.map((field, ruleIndex) => (
                <div className="relative items-end flex" key={ruleIndex}>
                    <RuleControl
                        ruleIndex={ruleIndex}
                        conditionIndex={conditionIndex}
                        steps={steps}
                    />
                </div>
            ))}
            <Button
                onClick={() => {
                    // form.setValue(
                    //     `priceConditions.${conditionIndex}.rules.${ruleIndex}.`
                    // )
                    rulesArray.append({});
                }}
                variant="secondary"
                size="sm"
            >
                Add Condition
            </Button>
        </>
    );
}
interface RuleControlProps {
    ruleIndex;
    conditionIndex;
    steps: DykeStep[];
}
function RuleControl({ ruleIndex, conditionIndex, steps }: RuleControlProps) {
    const form: UseFormReturn<DykeStep["step"]["meta"]> = useFormContext();

    const [stepId, value] = form.watch([
        `priceConditions.${conditionIndex}.rules.${ruleIndex}.stepId`,
        `priceConditions.${conditionIndex}.rules.${ruleIndex}.value`,
    ]);
    const [products, setProducts] = useState<{ name; stepId; id }[]>([]);

    useEffect(() => {
        const step = steps.find((s) => s.step.id == stepId);
        console.log(stepId);
        if (
            products.length &&
            products.filter((s) => s.stepId == stepId).length
        )
            return;
        if (!stepId) {
            setProducts([]);
            return;
        }
        (async () => {
            // const resp = await getStepForm(stepId);
            const resp = await getStepProduct(stepId);

            setProducts(
                resp?.map((p) => {
                    return {
                        name: p.product?.title,
                        id: p.product?.id,
                        stepId: p.dykeStepId,
                    };
                })
            );
        })();
        console.log(step);
    }, [stepId, value]);
    return (
        <>
            <ControlledSelect
                label={"Step"}
                control={form.control}
                size="sm"
                options={steps.map((s) => s.step)}
                name={`priceConditions.${conditionIndex}.rules.${ruleIndex}.stepId`}
                className="w-[45%]"
                titleKey={"title"}
                valueKey="id"
            />
            <div className="mb-2">
                <Icons.arrowRight className="w-4 h-4" />
            </div>
            <ControlledSelect
                label={"Product"}
                control={form.control}
                size="sm"
                className="w-[45%]"
                options={products}
                name={`priceConditions.${conditionIndex}.rules.${ruleIndex}.value`}
                titleKey={"name"}
                valueKey="name"
                placeholder={"+ equals"}
            />
        </>
    );
}
