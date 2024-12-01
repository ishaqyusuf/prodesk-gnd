import Modal from "@/components/common/modal";
import { useFormDataStore } from "../../../_common/_stores/form-data-store";
import { createContext, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";

import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { ComponentHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ControlledInput from "@/components/common/controls/controlled-input";
import { saveComponentPricingUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-pricing-use-case";

interface Props {
    cls: ComponentHelperClass;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
const pricingOptions = ["Single Pricing", "Multi Pricing"] as const;
type PricingOption = (typeof pricingOptions)[number];
export function openEditComponentPrice(cls: ComponentHelperClass) {
    _modal.openModal(<ComponentPriceModal cls={cls} />);
}
export function useInitContext(cls: ComponentHelperClass) {
    const zus = useFormDataStore();
    const memoied = useMemo(() => {
        const step = cls.getStepForm();
        const priceModel = cls.getComponentPriceModel();
        return {
            step,
            priceModel,
        };
    }, [cls]);

    const form = useForm<ReturnType<typeof cls.getComponentPriceModel>>({
        defaultValues: memoied.priceModel,
    });
    async function save() {
        const data = form.getValues("pricing");
        // const updates = ;
        const priceUpdate = await saveComponentPricingUseCase(
            Object.entries(data)
                .filter(([k, val]) => {
                    const prevPrice = memoied.priceModel.pricing?.[k]?.price;
                    return val?.price != prevPrice;
                })
                .map(([dependenciesUid, data]) => ({
                    id: data.id,
                    price: data.price ? Number(data.price) : null,
                    dependenciesUid,
                    dykeStepId: cls.getStepForm().stepId,
                    stepProductUid: cls.componentUid,
                }))
        );
        await cls.fetchUpdatedPrice();
        _modal.close();
        toast.success("Pricing Updated.");
    }

    return {
        form,
        priceModel: memoied.priceModel,
        cls,
        save,
    };
}
export default function ComponentPriceModal({ cls }: Props) {
    const ctx = useInitContext(cls);

    return (
        <Context.Provider value={ctx}>
            <Modal.Content>
                <Modal.Header
                    title={ctx.cls?.getComponent?.title || "Component Price"}
                    subtitle={"Edit component price"}
                />
                <Form {...ctx.form}>
                    <ScrollArea className="max-h-[50vh]">
                        {ctx.priceModel?.priceVariants?.map(
                            (variant, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 items-center border-b py-2"
                                >
                                    <div className="flex-1">
                                        {variant?.title?.map((title) => (
                                            <Badge
                                                className=""
                                                variant="outline"
                                                key={title}
                                            >
                                                {title}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="w-28">
                                        <ControlledInput
                                            prefix="$"
                                            control={ctx.form.control}
                                            size="sm"
                                            name={`pricing.${variant.path}.price`}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </ScrollArea>
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
