import Modal from "@/components/common/modal";
import { Form } from "@/components/ui/form";
import { useForm, UseFormReturn } from "react-hook-form";
import { DykeForm, DykeStep } from "../../../type";
import { useEffect, useState } from "react";
import { IStepProducts } from "../step-items-list/item-section/step-items";
import {
    getDykeStepState,
    getFormSteps,
} from "../step-items-list/item-section/step-items/init-step-components";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import {
    updateDykeStepMeta,
    updateDykeStepProductMeta,
} from "../../_action/dyke-step-setting";
import { useModal } from "@/components/common/modal/provider";

interface Props {
    lineItemIndex: number;
    stepIndex;
    invoiceForm: UseFormReturn<DykeForm>;
    stepItem: IStepProducts[number];
    stepForm: DykeStep;
    onComplete;
}
export default function DeleteItemModal({
    lineItemIndex,
    stepIndex,
    invoiceForm,
    stepForm,
    stepItem,
    onComplete,
}: Props) {
    const form = useForm({
        defaultValues: {
            deleteSelections: {},
            deletables: [],
        },
    });
    const [deletables, setDeletables] = useState<
        ReturnType<typeof getDykeStepState>
    >([]);
    useEffect(() => {
        const formArray = invoiceForm.getValues(
            `itemArray.${lineItemIndex}.item.formStepArray`
        );
        const _depFormSteps = getFormSteps(formArray, stepIndex);
        const stateDeps = getDykeStepState(_depFormSteps, stepForm);
        console.log({ stateDeps, stepItem, stepForm });
        setDeletables(stateDeps);
    }, []);
    const modal = useModal();
    async function submit() {
        const d = form.getValues("deletables");

        const stepItemMeta = stepItem.meta;
        const stateDeps = {};
        Object.entries({ ...stepItemMeta.deleted, ...d }).map(
            ([a, b]) => b && (stateDeps[a] = true)
        );
        stepItemMeta.deleted = stateDeps;
        await updateDykeStepProductMeta(stepItem.id, stepItemMeta);
        stepItem._metaData.hidden = true;
        stepItem.meta = stepItemMeta;
        console.log(stepItemMeta);
        onComplete && onComplete(stepItem);
        modal.close();
    }
    return (
        <Form {...form}>
            <Modal.Content>
                {deletables?.length ? (
                    <>
                        <Modal.Header
                            title={"Delete"}
                            subtitle={
                                "Select component combination to delete this item for"
                            }
                        />
                        <div className="">
                            <Table>
                                <TableBody>
                                    {deletables?.map((d, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <ControlledCheckbox
                                                    control={form.control}
                                                    name={
                                                        `deletables.${d.key}` as any
                                                    }
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
                        <Modal.Footer
                            submitText="Delete"
                            cancelText="Cancel"
                            onSubmit={submit}
                        />
                    </>
                ) : (
                    <>
                        <Modal.Header title={"Confirm Delete"} />
                        <div className="">
                            <span>
                                This component has no dependencies. Continue
                                delete?
                            </span>
                        </div>
                        <Modal.Footer
                            submitText="Delete"
                            cancelText="Cancel"
                            onSubmit={submit}
                        />
                    </>
                )}
            </Modal.Content>
        </Form>
    );
}
