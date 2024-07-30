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
import { Table, TableBody, TableRow } from "@/components/ui/table";

interface Props {
    lineItemIndex: number;
    stepIndex;
    invoiceForm: UseFormReturn<DykeForm>;
    stepItem: IStepProducts[number];
    stepForm: DykeStep;
}
export default function DeleteItemModal({
    lineItemIndex,
    stepIndex,
    invoiceForm,
    stepForm,
    stepItem,
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
        console.log({ stateDeps, stepForm });
        setDeletables(stateDeps);
    }, []);
    async function submit() {}
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
                                        <TableRow key={i}></TableRow>
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
