"use client";

import { useEffect, useRef, useState } from "react";
import { GetSalesBookForm } from "../../../_common/use-case/sales-book-form-use-case";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { zhInitializeState } from "../_utils/helpers/zus/zus-form-helper";
import ItemSection from "./item-section";
import { FormHeader } from "./form-header";
import { Button } from "@/components/ui/button";
import {
    harvestDoorPricingUseCase,
    saveHarvestedDoorPricingUseCase,
} from "../../../_common/use-case/step-component-use-case";
import { toast } from "sonner";

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
        </div>
    );
}
