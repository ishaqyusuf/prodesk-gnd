import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import HousePackageTool from "./house-package-tool";
import ServiceStep from "./service-step";
import { ComponentsStep } from "./components-step";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/use-number";
import { useEffect } from "react";
import { useIsVisible } from "@/hooks/use-is-visible";
import { motion } from "framer-motion";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";

interface Props {
    stepUid?;
}
export function StepSection({ stepUid }: Props) {
    const zus = useFormDataStore();
    const stepForm = zus?.kvStepForm?.[stepUid];
    const [uid] = stepUid?.split("-");
    const zItem = zus?.kvFormItem?.[uid];

    function Render() {
        if (stepForm?.isHpt)
            return (
                <Content>
                    <HousePackageTool stepUid={stepUid} />
                </Content>
            );
        if (stepForm?.isService)
            return (
                <Content>
                    <ServiceStep stepUid={stepUid} />
                </Content>
            );
        return (
            <Content>
                {zus.sequence?.stepComponent?.[uid]?.map((stepUid) => (
                    <ComponentsStep key={stepUid} stepUid={stepUid} />
                ))}
            </Content>
        );
    }
    function Content({ children }) {
        const { isVisible, elementRef } = useIsVisible({});
        useEffect(() => {
            setTimeout(() => {
                if (!isVisible && elementRef.current) {
                    const offset = -150; // Adjust this value to your desired offset
                    const elementPosition =
                        elementRef.current.getBoundingClientRect().top +
                        window.scrollY;
                    const offsetPosition = elementPosition + offset;
                    // elementRef.current.scrollIntoView({
                    //     behavior: "smooth",
                    //     block: "start",
                    // });
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }, 300);
        }, []);
        return (
            <CollapsibleContent className="flex p-8 border">
                <motion.div
                    ref={elementRef}
                    // initial={{ opacity: 0 }}
                    // animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    style={{}}
                >
                    <div className="flex-1 flex flex-col">{children}</div>
                </motion.div>
            </CollapsibleContent>
        );
    }
    return (
        <div>
            <div className="mx-4">
                <Collapsible open={zItem.currentStepUid == stepUid}>
                    <StepSectionHeader stepUid={stepUid} />
                    <Render />
                </Collapsible>
            </div>
        </div>
    );
}
function StepSectionHeader({ stepUid }) {
    const zus = useFormDataStore();
    const stepForm = zus?.kvStepForm?.[stepUid];
    return (
        <CollapsibleTrigger asChild>
            <div className="">
                <button
                    className="flex  w-full p-1 px-4 border space-x-2 items-center text-sm uppercase"
                    onClick={(e) => {
                        e.preventDefault();
                        zus.toggleStep(stepUid);
                    }}
                >
                    <Label>{stepForm?.title}:</Label>
                    <span className="font-mono">{stepForm.value}</span>
                    {stepForm.price && (
                        <Badge variant="destructive" className="h-5 px-1">
                            ${formatMoney(stepForm.price)}
                        </Badge>
                    )}
                </button>
            </div>
        </CollapsibleTrigger>
    );
}
