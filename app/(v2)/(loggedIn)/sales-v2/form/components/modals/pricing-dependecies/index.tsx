"use  client";

import Modal from "@/components/common/modal";
import { useForm, UseFormReturn } from "react-hook-form";
import { DykeForm, DykeStep, DykeStepMeta } from "../../../../type";
import { Form } from "@/components/ui/form";

import { useModal } from "@/components/common/modal/provider";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { saveDykeMeta } from "./action";
import { initStepComponents } from "../../step-items-list/item-section/step-products/init-step-components";

interface Props {
    form: UseFormReturn<DykeForm>;
    stepForm: DykeStep;
    stepIndex;
    rowIndex;
    stepProducts;
    setStepProducts;
    settingKey: keyof DykeStepMeta;
}
export default function PricingDependenciesModal({
    form,
    stepForm,
    stepIndex,
    rowIndex,
    settingKey,
    stepProducts,
    setStepProducts,
}: Props) {
    const stepArray = form.getValues(
        `itemArray.${rowIndex}.item.formStepArray`
    );

    const deps = {};
    if (!stepForm.step.meta[settingKey])
        stepForm.step.meta[settingKey] = {} as any;
    const steps = stepArray
        .filter(
            (_, i) =>
                i < stepIndex &&
                !_.item.meta.hidden &&
                ["Door", "Moulding"].every((s) => s != _.step.title)
        )
        .map((s) => {
            const checked = stepForm.step.meta[settingKey][s.step.uid];
            if (checked) deps[s.step.uid] = true;
            return s.step;
        });

    stepForm.step.meta.priceDepencies = deps;
    const _form = useForm({
        defaultValues: {
            deps,
        },
    });
    async function save() {
        stepForm.step.meta[settingKey] = _form.getValues("deps") as any;
        // delete (stepForm.step.meta as any)[settingKey];
        const _ = await saveDykeMeta(stepForm.step.id, stepForm.step.meta);
        form.setValue(
            `itemArray.${rowIndex}.item.formStepArray.${stepIndex}` as any,
            stepForm
        );
        setStepProducts(
            await initStepComponents(form, {
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
                    title={
                        settingKey == "priceDepencies"
                            ? `Price Variation Deps`
                            : `Component Deps`
                    }
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
