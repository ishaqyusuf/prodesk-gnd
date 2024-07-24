"use  client";

import Modal from "@/components/common/modal";
import { useForm, UseFormReturn } from "react-hook-form";
import { DykeForm, DykeStep } from "../../../../type";
import { Form } from "@/components/ui/form";

import { useModal } from "@/components/common/modal/provider";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { savePriceDepencies } from "./action";
import { fetchStepComponentsPrice } from "../../step-items-list/item-section/step-items/calculate-component-price";

interface Props {
    form: UseFormReturn<DykeForm>;
    stepForm: DykeStep;
    stepIndex;
    rowIndex;
    stepProducts;
    setStepProducts;
}
export default function PricingDependenciesModal({
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
    const deps = {};
    if (!stepForm.step.meta.priceDepencies)
        stepForm.step.meta.priceDepencies = {};
    const steps = stepArray
        .filter(
            (_, i) =>
                i < stepIndex &&
                !_.item.meta.hidden &&
                ["Door", "Moulding"].every((s) => s != _.step.title)
        )
        .map((s) => {
            const checked = stepForm.step.meta.priceDepencies[s.step.uid];
            if (checked) deps[s.step.uid] = true;
            return s.step;
        });

    // console.log(steps);

    stepForm.step.meta.priceDepencies = deps;
    const _form = useForm({
        defaultValues: {
            deps,
        },
    });
    async function save() {
        stepForm.step.meta.priceDepencies = _form.getValues("deps");
        delete (stepForm.step.meta as any).priceConditions;
        const _ = await savePriceDepencies(
            stepForm.step.id,
            stepForm.step.meta
        );
        form.setValue(
            `itemArray.${rowIndex}.item.formStepArray.${stepIndex}` as any,
            stepForm
        );
        setStepProducts(
            await fetchStepComponentsPrice({
                stepForm,
                stepProducts,
                stepIndex,
                stepArray,
            })
        );
        modal.close();
    }
    const modal = useModal();
    return (
        <Form {..._form}>
            <Modal.Content size="sm">
                <Modal.Header
                    title={`Price Variation Dependencies`}
                    subtitle={stepForm.step.title}
                />
                <Table>
                    <TableBody>
                        {steps.map((step) => (
                            <TableRow key={step.uid}>
                                <TableCell>
                                    <ControlledCheckbox
                                        control={_form.control}
                                        name={`deps.${step.uid}` as any}
                                        label={step.title}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Modal.Footer submitText="save" onSubmit={save} />
            </Modal.Content>
        </Form>
    );
}
