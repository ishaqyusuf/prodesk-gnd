"use client";

import { useEffect } from "react";
import { GetSalesBookForm } from "../../../_common/use-case/sales-book-form-use-case";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import {
    zhAddItem,
    zhInitializeState,
} from "../_utils/helpers/zus/zus-form-helper";
import ItemSection from "./item-section";
import { FormHeader } from "./form-header";
import { Button } from "@/components/ui/button";

import { Icons } from "@/components/_v1/icons";
import { useSticky } from "../_hooks/use-sticky";
import { FormDataPage } from "./data-page";
import { cn } from "@/lib/utils";
import { FormFooter } from "./form-footer";

interface FormClientProps {
    data: GetSalesBookForm;
}

export function FormClient({ data }: FormClientProps) {
    const zus = useFormDataStore();
    useEffect(() => {
        zus.init(zhInitializeState(data));
    }, []);
    const sticky = useSticky((bv, pv, { top, bottom }) => {
        return top < 100;
    });

    if (!zus.formStatus) return <></>;
    return (
        <div className="mb-28 bg-white">
            <FormHeader sticky={sticky} />
            <div
                ref={sticky.containerRef}
                className={cn(sticky.isFixed && "mt-10")}
            >
                <div
                    className={cn(
                        zus.currentTab != "info" &&
                            "opacity-0 h-0 z-0 w-0 overflow-hidden"
                    )}
                >
                    <FormDataPage />
                </div>
            </div>
            <div
                className={cn(
                    zus.currentTab == "info" &&
                        "opacity-0 h-0 z-0 w-0 overflow-hidden"
                )}
            >
                {zus.sequence?.formItem?.map((uid) => (
                    <ItemSection key={uid} uid={uid} />
                ))}
            </div>
            <FormFooter />
        </div>
    );
}
