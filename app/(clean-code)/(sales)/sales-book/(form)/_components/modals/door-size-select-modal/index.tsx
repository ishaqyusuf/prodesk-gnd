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
import { zhHarvestDoorSizes } from "../../../_utils/helpers/zus/zus-form-helper";

interface Props {
    cls: ComponentHelperClass;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
const pricingOptions = ["Single Pricing", "Multi Pricing"] as const;
type PricingOption = (typeof pricingOptions)[number];
export function openDoorSizeSelectModal(cls: ComponentHelperClass) {
    _modal.openModal(<DoorSizeSelectModal cls={cls} />);
}
export function useInitContext(cls: ComponentHelperClass) {
    const priceModel = cls.getDoorPriceModel();

    const form = useForm({
        defaultValues: {
            ...priceModel.formData,
        },
    });
    async function save() {
        const data = form.getValues();
        const oldPv = priceModel.formData.priceVariants;
        const priceUpdate = await saveComponentPricingUseCase(
            Object.entries(data.priceVariants)
                .filter(([k, val]) => {
                    const prevPrice = oldPv?.[k]?.price;
                    return val?.price != prevPrice;
                })
                .map(([dependenciesUid, _data]) => ({
                    id: _data.id,
                    price: _data.price ? Number(_data.price) : null,
                    dependenciesUid,
                    dykeStepId: data.dykeStepId,
                    stepProductUid: data.stepProductUid,
                }))
        );
        await cls.fetchUpdatedPrice();
        _modal.close();
        toast.success("Pricing Updated.");
    }

    return {
        form,
        // priceModel: memoied.priceModel,
        cls,
        save,
        sizeList: priceModel.sizeList,
    };
}
export default function DoorSizeSelectModal({ cls }: Props) {
    const ctx = useInitContext(cls);

    return (
        <Context.Provider value={ctx}>
            <Modal.Content>
                <Modal.Header
                    title={ctx.cls?.getComponent?.title || "Component Price"}
                    subtitle={"Edit door size price"}
                />
                <Form {...ctx.form}>
                    <ScrollArea
                        tabIndex={-1}
                        className="max-h-[50vh] px-4 -mx-4"
                    >
                        {ctx.sizeList?.map((variant, index) => (
                            <div
                                key={index}
                                className="flex gap-4 items-center border-b py-2"
                            >
                                <div className="flex-1">
                                    <Badge className="" variant="outline">
                                        {variant.size}
                                    </Badge>
                                </div>
                                <div className="w-28">
                                    <ControlledInput
                                        prefix="$"
                                        tabIndex={index + 50}
                                        control={ctx.form.control}
                                        size="sm"
                                        name={`priceVariants.${variant.size}.price`}
                                    />
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
