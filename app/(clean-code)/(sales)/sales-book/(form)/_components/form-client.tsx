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

interface FormClientProps {
    data: GetSalesBookForm;
}

export function FormClient({ data }: FormClientProps) {
    const zus = useFormDataStore();
    useEffect(() => {
        zus.init(zhInitializeState(data));
    }, []);
    const sticky = useSticky((bv, pv, { top, bottom }) => top < 100);
    return (
        <div className="mb-28">
            <FormHeader sticky={sticky} />
            <div
                ref={sticky.containerRef}
                className={cn(sticky.isFixed && "mt-10")}
            >
                {zus.currentTab == "info" ? (
                    <FormDataPage />
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}
