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
    async function save() {}
    function addRule() {
        varArray.append({
            rules: [{ componentsUid: [], stepUid: null, operator: "is" }],
        });
    }
    return {
        varArray,
        step,
        form,
        save,
        addRule,
    };
}
export default function ComponentVisibilityModal({
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
                        options={[
                            { value: "1", label: "Hello" },
                            { value: "2", label: "Hi" },
                        ]}
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
                            options={[
                                { value: "1", label: "Hello" },
                                { value: "2", label: "Hi" },
                            ]}
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
                <Button onClick={addRuleFilter} className="h-7 text-xs">
                    <Icons.add className="w-4 h-4 mr-2" />
                    <span>Add Filter</span>
                </Button>
            </div>
        </div>
    );
}
