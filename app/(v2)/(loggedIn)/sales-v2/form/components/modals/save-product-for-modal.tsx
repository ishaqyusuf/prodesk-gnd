import Modal from "@/components/common/modal";
import { Form } from "@/components/ui/form";
import { useForm, UseFormReturn } from "react-hook-form";
import { DykeForm, DykeStep } from "../../../type";
import { useEffect, useState } from "react";
import { IStepProducts } from "../step-items-list/item-section/component-products";
import {
    getDykeStepState,
    getFormSteps,
} from "../step-items-list/item-section/component-products/init-step-components";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { useModal } from "@/components/common/modal/provider";
import { _deleteStepItem } from "../step-items-list/item-section/component-products/_actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    lineItemIndex: number;
    stepIndex;
    invoiceForm: UseFormReturn<DykeForm>;
    // stepItem?: IStepProducts[number];
    // stepItems: IStepProducts;
    stepForm: DykeStep;
    formData;
    onComplete(resp);
}
export default function SaveProductForModal({
    lineItemIndex,
    stepIndex,
    formData,
    // stepItems,
    invoiceForm,
    stepForm,
    onComplete,
}: // onComplete,
Props) {
    const form = useForm({
        defaultValues: {
            deleteSelections: {},
            // deletables: {},
            show: formData || {},
        },
    });
    const [components, setComponents] = useState<
        ReturnType<typeof getDykeStepState>
    >([]);
    useEffect(() => {
        const formArray = invoiceForm.getValues(
            `itemArray.${lineItemIndex}.item.formStepArray`
        );
        const _depFormSteps = getFormSteps(formArray, stepIndex);
        // console.log({ _depFormSteps, stepForm, formData });
        const stateDeps = getDykeStepState(_depFormSteps, stepForm);
        setComponents(stateDeps);
    }, []);
    const modal = useModal();
    async function submit() {
        const d = form.getValues("show");
        let _show = {};
        let valid = false;
        Object.entries(d).map(
            ([k, v]) => v && (_show[k] = true) && (valid = true)
        );
        if (!valid) {
            toast.error(
                "Select atleast one component tree and use the visible for all button"
            );
            return;
        }
        onComplete(_show);
        modal.close();
    }
    async function saveForAll() {
        // saveForAll
        onComplete({});
        modal.close();
    }
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header
                    title={"Select Component Tree"}
                    subtitle={
                        <span className="whitespace-normal">
                            {`If selected, this component will only be
                                    visible on ${stepForm?.step?.title} when the
                                    component combination is selected. Click visible in all to make it always visible in ${stepForm?.step?.title}`}
                        </span>
                    }
                />
                <div className="">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Button
                                        onClick={saveForAll}
                                        className="w-full"
                                    >
                                        {`Visible in all`}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            {components?.map((d, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <ControlledCheckbox
                                            control={form.control}
                                            name={`show.${d.key}` as any}
                                            label={d.steps
                                                .map((s) => s.value)
                                                .join(" & ")}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Modal.Footer submitText="Save" onSubmit={submit} />
            </Modal.Content>
        </Form>
    );
}
