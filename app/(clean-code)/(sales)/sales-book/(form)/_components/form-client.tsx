"use client";

import { useEffect, useRef, useState } from "react";
import { GetSalesBookForm } from "../../../_common/use-case/sales-book-form-use-case";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import {
    zhAddItem,
    zhInitializeState,
} from "../_utils/helpers/zus/zus-form-helper";
import ItemSection from "./item-section";
import { FormHeader } from "./form-header";
import { Button } from "@/components/ui/button";
import {
    harvestDoorPricingUseCase,
    saveHarvestedDoorPricingUseCase,
} from "../../../_common/use-case/step-component-use-case";
import { toast } from "sonner";
import { Icons } from "@/components/_v1/icons";

interface FormClientProps {
    data: GetSalesBookForm;
}

export function FormClient({ data }: FormClientProps) {
    const zus = useFormDataStore();
    useEffect(() => {
        zus.init(zhInitializeState(data));
    }, []);

    return (
        <div className="mb-28">
            <FormHeader />
            {zus.sequence?.formItem?.map((uid) => (
                <ItemSection key={uid} uid={uid} />
            ))}
            <div className="flex mt-4 justify-end">
                <Button
                    onClick={() => {
                        zhAddItem();
                    }}
                >
                    <Icons.add className="w-4 h-4 mr-2" />
                    <span>Add</span>
                </Button>
            </div>
        </div>
    );
}
