import { useForm } from "react-hook-form";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import { UseStepContext } from "./ctx";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/common/controls/form-input";
import Button from "@/components/common/button";
import { useMemo } from "react";
import AutoComplete from "@/components/_v1/common/auto-complete";

interface Props {
    ctx: UseStepContext;
}
export function CustomComponent({ ctx }: Props) {
    const zus = useFormDataStore();
    const stepForm = ctx.cls.getItemForm();
    const form = useForm({
        defaultValues: {
            title: "",
            basePrice: "",
            salesPrice: "",
        },
    });
    const customInputs = useMemo(
        () => ctx.stepComponents?.filter((s) => s._metaData.custom),
        [ctx.stepComponents]
    );
    const hasCost = useMemo(
        () => ctx.items?.filter((s) => s.salesPrice)?.length > 0,
        [ctx.items]
    );
    async function _continue() {}
    return (
        <Form {...form}>
            <div className="relative p-2 min-h-[25vh] xl:min-h-[40hv]  group  flex flex-col gap-4">
                {customInputs?.length ? (
                    <AutoComplete
                        onSelect={(value: any) => {
                            form.setValue("salesPrice", value?.salesPrice);
                            form.setValue("basePrice", value?.basePrice);
                        }}
                        itemText={"label"}
                        itemValue={"value"}
                        options={customInputs}
                        size="sm"
                        form={form}
                        formKey={"title"}
                        label={"Custom"}
                        perPage={10}
                    />
                ) : (
                    <FormInput
                        label="Custom"
                        size="sm"
                        control={form.control}
                        name="title"
                    />
                )}
                {hasCost ? (
                    <FormInput
                        label="Price"
                        type="number"
                        size="sm"
                        prefix="$"
                        control={form.control}
                        name="basePrice"
                    />
                ) : null}
                <div className="flex justify-end">
                    <Button onClick={_continue}>Continue</Button>
                </div>
            </div>
        </Form>
    );
}
