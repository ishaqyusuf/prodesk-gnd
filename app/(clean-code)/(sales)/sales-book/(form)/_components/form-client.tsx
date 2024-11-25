"use client";

import { useEffect } from "react";
import { GetSalesBookForm } from "../../../_common/use-case/sales-book-form-use-case";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { zhInitializeState } from "../_utils/helpers/zus/zus-form-helper";
import ItemSection from "./item-section";

interface FormClientProps {
    data: GetSalesBookForm;
}

export function FormClient({ data }: FormClientProps) {
    const zus = useFormDataStore();
    useEffect(() => {
        zus.init(zhInitializeState(data));
    }, []);
    return (
        <div>
            {zus.sequence?.formItem?.map((uid) => (
                <ItemSection key={uid} uid={uid} />
            ))}
        </div>
    );
}
