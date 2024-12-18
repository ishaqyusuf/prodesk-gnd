import Modal from "@/components/common/modal";
import { useFormDataStore } from "../../../_common/_stores/form-data-store";
import { createContext, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import { ComboxBox } from "@/components/(clean-code)/custom/controlled/combo-box";

import {
    createComponentUseCase,
    updateStepMetaUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { StepHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";
import FormInput from "@/components/common/controls/form-input";
import { StepComponentForm } from "@/app/(clean-code)/(sales)/types";

interface Props {
    stepCls: StepHelperClass;
    data: StepComponentForm;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
export function openComponentModal(
    stepCls: StepHelperClass,
    data?: Props["data"]
) {
    if (!data) {
        data = {
            title: "",
            stepId: stepCls.getStepForm().stepId,
            isDoor: stepCls.isDoor(),
        };
        console.log(data);
    }
    _modal.openModal(<StepComponentFormModal stepCls={stepCls} data={data} />);
}
export function useInitContext(props: Props) {
    const form = useForm({
        defaultValues: {
            ...props.data,
        },
    });
    const cls = props.stepCls;
    async function save() {
        const data = form.getValues();
        const resp = await createComponentUseCase(data);
        cls.addStepComponent(resp);
        _modal.close();
        toast.success("Saved.");
    }
    return {
        form,
        save,
    };
}
export default function StepComponentFormModal(props: Props) {
    const ctx = useInitContext(props);
    return (
        <Context.Provider value={ctx}>
            <Modal.Content>
                <Modal.Header title={"Step Component"} subtitle={""} />
                <Form {...ctx.form}>
                    <FormInput
                        control={ctx.form.control}
                        name="title"
                        label="Component Name"
                    />
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
