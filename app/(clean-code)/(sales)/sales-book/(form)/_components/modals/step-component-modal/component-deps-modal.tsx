import Modal from "@/components/common/modal";
import { Form } from "@/components/ui/form";
import { useForm, UseFormReturn } from "react-hook-form";
import {
    DykeForm,
    DykeStep,
} from "../../../../../../../(v2)/(loggedIn)/sales-v2/type";
import { useEffect, useState } from "react";
import { IStepProducts } from "../../../../../../../(v2)/(loggedIn)/sales-v2/form/components/step-items-list/item-section/step-products";
import {
    getDykeStepState,
    getFormSteps,
} from "../../../../../../../(v2)/(loggedIn)/sales-v2/form/components/step-items-list/item-section/step-products/init-step-components";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { useModal } from "@/components/common/modal/provider";
import { _deleteStepItem } from "../../../../../../../(v2)/(loggedIn)/sales-v2/form/components/step-items-list/item-section/step-products/_actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LegacyDykeFormStepType } from "../../../_hooks/legacy-hooks";
import stepHelpers, { StepProduct } from "../../../_utils/helpers/step-helper";

interface Props {
    // lineItemIndex: number;
    // stepIndex;
    // invoiceForm: UseFormReturn<DykeForm>;
    // // stepItem?: IStepProducts[number];
    // // stepItems: IStepProducts;
    // stepForm: DykeStep;
    // formData;
    // onComplete(resp);
    ctx: LegacyDykeFormStepType;
    formData: StepProduct;
}
export default function ComponentDepsModal({
    // lineItemIndex,
    // stepIndex,
    // formData,
    // // stepItems,
    // invoiceForm,
    // stepForm,
    // onComplete,
    ctx,
    formData,
}: // onComplete,
Props) {
    const defaultValues = {
        deleteSelections: {},
        show: formData?.meta?.show || {},
    };
    const form = useForm({
        defaultValues,
    });
    const [components, setComponents] = useState([]);

    async function submit() {
        await stepHelpers.saveComponent(ctx, formData, form);
    }
    useEffect(() => {
        const ls = stepHelpers.getDykeStepState(ctx);
        if (ls.length) setComponents(ls);
        else saveForAll();
    }, []);
    async function saveForAll() {
        // saveForAll
        // onComplete({});
        await stepHelpers.saveComponent(ctx, formData);
        // modal.close();
    }
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header
                    title={"Select Component Tree"}
                    subtitle={
                        <span className="whitespace-normal">
                            {`If selected, this component will only be
                                    visible on ${ctx?.step?.step?.title} when the
                                    component combination is selected. Click visible in all to make it always visible in ${ctx?.step?.step?.title}`}
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