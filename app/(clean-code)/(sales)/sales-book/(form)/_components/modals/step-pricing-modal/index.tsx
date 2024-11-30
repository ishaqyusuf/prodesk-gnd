import Modal from "@/components/common/modal";
import { useFormDataStore } from "../../../_common/_stores/form-data-store";
import { createContext, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { ComboxBox } from "@/components/(clean-code)/custom/controlled/combo-box";

import { updateStepMetaUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { StepHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";

interface Props {
    stepUid;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
const pricingOptions = ["Single Pricing", "Multi Pricing"] as const;
type PricingOption = (typeof pricingOptions)[number];
export function useInitContext(itemStepUid) {
    const zus = useFormDataStore();
    const cls = useMemo(() => {
        return new StepHelperClass(itemStepUid, zus);
    }, [itemStepUid, zus]);

    const step = cls.getStepForm();
    const data = cls.getComponentVariantData();

    const stepList = data.steps;

    const form = useForm({
        defaultValues: {
            meta: step?.meta,
            pricingOption:
                step?.meta?.priceStepDeps?.length > 0
                    ? "Multi Pricing"
                    : ("Single Pricing" as PricingOption),
        },
    });
    const pricingOption = form.watch("pricingOption");

    async function save() {
        const { meta } = form.getValues();

        if (pricingOption == "Single Pricing") {
            meta.priceStepDeps = [];
        } else {
            if (meta.priceStepDeps?.length == 0 || !meta.priceStepDeps) {
                toast.error(
                    `Multi Pricing requires atleast one price dependencies.`
                );
                return;
            }
        }
        const resp = await updateStepMetaUseCase(step?.stepId, meta);

        _modal.close();
        toast.success("Pricing Updated.");
    }

    return {
        form,
        save,
        stepList,
        pricingOption,
    };
}
export default function StepPricingModal({ stepUid }: Props) {
    const ctx = useInitContext(stepUid);
    return (
        <Context.Provider value={ctx}>
            <Modal.Content>
                <Modal.Header
                    title={"Step Pricing"}
                    subtitle={
                        "A component can have a single price or multiple prices based on dependent components."
                    }
                />
                <Form {...ctx.form}>
                    <ControlledSelect
                        options={[...pricingOptions]}
                        name="pricingOption"
                        label={"Pricing Type"}
                        size="sm"
                        control={ctx.form.control}
                    />
                    {ctx.pricingOption == "Multi Pricing" ? (
                        <ComboxBox
                            maxSelection={999}
                            maxStack={5}
                            options={ctx.stepList}
                            labelKey="title"
                            valueKey="uid"
                            className="w-full"
                            placeholder="Select Steps"
                            label={"Pricing Steps Dependencies"}
                            control={ctx.form.control}
                            name={`meta.priceStepDeps`}
                        />
                    ) : null}
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
