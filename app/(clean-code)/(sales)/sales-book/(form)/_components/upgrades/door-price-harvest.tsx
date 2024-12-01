import {
    harvestDoorPricingUseCase,
    saveHarvestedDoorPricingUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function DoorPriceHarvest({}) {
    const [isProcessing, setIsProcessing] = useState(false);

    let toastId = useRef(null);
    const indexRef = useRef(0);
    return (
        <Button
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
    );
}
