import Modal from "@/components/common/modal";
import { useFormDataStore } from "../../../_common/_stores/form-data-store";
import { createContext, useContext, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { Form } from "@/components/ui/form";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { ComboxBox } from "@/components/(clean-code)/custom/controlled/combo-box";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import {
    zhComponentVariantUpdated,
    zhGetComponentVariantData,
} from "../../../_utils/helpers/zus/zus-component-helper";
import {
    saveComponentVariantUseCase,
    updateStepMetaUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
    stepUid;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
const pricingOptions = ["Single Pricing", "Multi Pricing"] as const;
type PricingOption = (typeof pricingOptions)[number];
export function useInitContext(itemStepUid) {
    const zus = useFormDataStore();
    const [itemUid, stepUid] = itemStepUid.split("-");
    const step = zus.kvStepForm[itemStepUid];

    const data = zhGetComponentVariantData(itemStepUid, zus);
    const stepList = data.steps;
    const form = useForm({
        defaultValues: {
            meta: step?.meta,
            pricingOption:
                step?.meta?.stepPricingDeps?.length > 0
                    ? "Multi Pricing"
                    : ("Single Pricing" as PricingOption),
        },
    });
    const pricingOption = form.watch("pricingOption");
    // const varArray = useFieldArray({
    //     control: form.control,
    //     name: "variations",
    // });
    async function save() {
        const { meta } = form.getValues();
        console.log(meta);

        if (pricingOption == "Single Pricing") {
            meta.stepPricingDeps = [];
        } else {
            if (meta.stepPricingDeps?.length == 0 || !meta.stepPricingDeps) {
                toast.error(
                    `Multi Pricing requires atleast one price dependencies.`
                );
                return;
            }
        }
        const resp = await updateStepMetaUseCase(step?.stepId, meta);
        console.log({ resp });

        _modal.close();
        toast.success("Pricing Updated.");
        // zhComponentVariantUpdated(stepUid, componentsUid, formData, zus);
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
                            options={ctx.stepList}
                            labelKey="title"
                            valueKey="uid"
                            className="w-full"
                            placeholder="Select Steps"
                            label={"Pricing Steps Dependencies"}
                            control={ctx.form.control}
                            name={`meta.stepPricingDeps`}
                        />
                    ) : null}
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
