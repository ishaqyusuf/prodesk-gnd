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
import { saveComponentVariantUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";

interface Props {
    stepUid;
    componentUid;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
export function useInitContext(stepUid, componentUid) {
    const zus = useFormDataStore();
    const [itemUid, cStepUid] = stepUid.split("-");
    const component = zus.kvStepComponentList[cStepUid]?.find(
        (p) => p.uid == componentUid
    );
    const data = zhGetComponentVariantData(stepUid, componentUid, zus);
    const step = zus.kvStepForm[stepUid];
    const form = useForm({
        defaultValues: {
            variations: component?.variations,
        },
    });
    const varArray = useFieldArray({
        control: form.control,
        name: "variations",
    });
    async function save() {
        const formData = form.getValues("variations");
        await saveComponentVariantUseCase(componentUid, formData);
        _modal.close();
        toast.success("Component Visibility Updated.");
        zhComponentVariantUpdated(stepUid, componentUid, formData, zus);
    }
    function addRule() {
        varArray.append({
            rules: [{ componentsUid: [], stepUid: null, operator: "is" }],
        });
    }
    return {
        varArray,
        data,
        step,
        form,
        save,
        addRule,
    };
}
export default function ComponentVariantModal({
    stepUid,
    componentUid,
}: Props) {
    const ctx = useInitContext(stepUid, componentUid);

    return (
        <Context.Provider value={ctx}>
            <Modal.Content size="lg">
                <Modal.Header
                    title={"Edit Component Visibility"}
                    subtitle={
                        "Add rules to make component show only when rules are met."
                    }
                />
                <Form {...ctx.form}>
                    {ctx.varArray.fields?.length == 0 ? (
                        <>
                            <div className="">
                                <span className="text-muted-foreground">
                                    This component has not rules set, which
                                    means it will always be visible in{" "}
                                    <Badge
                                        className="font-mono"
                                        variant="outline"
                                    >
                                        {ctx.step?.title}
                                    </Badge>
                                </span>
                            </div>
                        </>
                    ) : (
                        <div>
                            {ctx.varArray.fields?.map((field, index) => (
                                <RuleComponent index={index} key={index} />
                            ))}
                        </div>
                    )}
                    <div className="mt-2">
                        <Button
                            onClick={ctx.addRule}
                            size="sm"
                            className="h-8 text-xs"
                        >
                            <Icons.add className="w-4 h-4 mr-2" />
                            <span>Add Rule</span>
                        </Button>
                    </div>
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
function RuleComponent({ index }) {
    const ctx = useCtx();
    const rulesArray = useFieldArray({
        control: ctx.form.control,
        name: `variations.${index}.rules`,
    });
    function addRuleFilter() {
        rulesArray.append({
            componentsUid: [],
            operator: "is",
            stepUid: null,
        });
    }
    return (
        <div className="flex flex-col gap-2 overflow-y-auto py-0.5 pr-1">
            {rulesArray?.fields?.map((field, fieldIndex) => (
                <div className="flex items-center gap-2" key={fieldIndex}>
                    <div className="min-w-[4.5rem] text-center">
                        <span className="text-sm text-muted-foreground">
                            {fieldIndex == 0 ? "Where" : "and"}
                        </span>
                    </div>
                    <ComboxBox
                        options={ctx.data?.steps}
                        labelKey="title"
                        valueKey="uid"
                        control={ctx.form.control}
                        name={`variations.${index}.rules.${fieldIndex}.stepUid`}
                    />
                    <div className="min-w-[5rem]">
                        <ControlledSelect
                            control={ctx.form.control}
                            name={`variations.${index}.rules.${fieldIndex}.operator`}
                            size="sm"
                            options={["is", "isNot"]}
                        />
                    </div>
                    <div className="flex-1">
                        <ComboxBox
                            maxSelection={999}
                            options={
                                ctx.data?.componentsByStepUid[
                                    ctx.form.getValues(
                                        `variations.${index}.rules.${fieldIndex}.stepUid`
                                    )
                                ] || []
                            }
                            labelKey="title"
                            valueKey="uid"
                            className="w-full"
                            control={ctx.form.control}
                            name={`variations.${index}.rules.${fieldIndex}.componentsUid`}
                        />
                    </div>
                    <ConfirmBtn
                        onClick={(e) => {
                            rulesArray.remove(fieldIndex);
                        }}
                        trash
                        size="icon"
                    />
                </div>
            ))}
            <div className="flex justify-end">
                <Button
                    disabled={rulesArray.fields.length == ctx.data.stepsCount}
                    onClick={addRuleFilter}
                    className="h-7 text-xs"
                >
                    <Icons.add className="w-4 h-4 mr-2" />
                    <span>Add Filter</span>
                </Button>
            </div>
        </div>
    );
}
