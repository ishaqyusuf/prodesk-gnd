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
    const [isProcessing, setIsProcessing] = useState(false);

    let toastId = useRef(null);
    const indexRef = useRef(0);
    return (
        <div className="mb-28">
            <Button
                className="hidden"
                onClick={() => {
                    harvestDoorPricingUseCase().then((list) => {
                        console.log(list);

                        let index = 0;
                        const chunkSize = 50;
                        let toastId;
                        let cancel = false;

                        function cancelProcessing() {
                            cancel = true;
                            toast.dismiss(toastId);
                            toast("Processing canceled.");
                        }

                        async function processNextChunk() {
                            if (cancel) return;

                            if (index >= list.length) {
                                toast.dismiss(toastId);
                                toast.success("Processing complete!");
                                return;
                            }

                            const chunk = list.slice(index, index + chunkSize);

                            // Process the current chunk
                            //    await processChunkUseCase(chunk);
                            console.log(`PROCESSING: ${index}`);
                            const resp = await saveHarvestedDoorPricingUseCase(
                                chunk
                            );

                            console.log(resp);
                            // await new Promise((resolve) => {
                            //     setTimeout(() => {
                            //         resolve("");
                            //         console.log(
                            //             `PROCESSING COMPLETED: ${index}`
                            //         );
                            //     }, 4000);
                            // });

                            index += chunkSize;

                            toastId = toast(
                                `Processing items ${
                                    index - chunkSize + 1
                                } to ${index}`,
                                {
                                    action: {
                                        label: "Cancel",
                                        onClick: cancelProcessing,
                                    },
                                    duration: 2000,
                                }
                            );
                            // await processNextChunk();
                            setTimeout(processNextChunk, 3000); // Automatically process the next chunk
                        }
                        // toast.

                        toast.promise(
                            processNextChunk(),
                            {
                                loading: "Processing...",
                                success: "Processing started...",
                                error: "Error during processing!",
                            }
                            // { id: "chunk-toast" } // Ensures reuse of a single toast
                        );
                    });
                }}
            >
                Scrape Door Price
            </Button>
            <FormHeader />
            {zus.sequence?.formItem?.map((uid) => (
                <ItemSection key={uid} uid={uid} />
            ))}
        </div>
    );
}
