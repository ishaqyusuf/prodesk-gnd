import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import HousePackageTool from "./hpt-step";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/use-number";
import { useEffect, useMemo } from "react";
import { useIsVisible } from "@/hooks/use-is-visible";
import { motion } from "framer-motion";
import DevOnly from "@/_v2/components/common/dev-only";
import { zhtoggleStep } from "../_utils/helpers/zus/zus-step-helper";
import { StepHelperClass } from "../_utils/helpers/zus/zus-helper-class";
import MouldingLineItem from "./moulding-step";
import ServiceLineItem from "./service-step";
import { ComponentsSection } from "./components-section";

interface Props {
    stepUid?;
}
export function StepSection({ stepUid }: Props) {
    const zus = useFormDataStore();
    // const stepForm = zus?.kvStepForm?.[stepUid];
    const [uid] = stepUid?.split("-");
    const zItem = zus?.kvFormItem?.[uid];
    const cls = useMemo(() => {
        console.log(">>REFR");
        const cls = new StepHelperClass(stepUid);
        return cls;
    }, [
        stepUid,
        // , zus
    ]);
    useEffect(() => {
        console.log("REFRESHING>>>");
    }, []);
    function Render() {
        if (cls?.isHtp())
            return (
                <Content>
                    <HousePackageTool itemStepUid={stepUid} />
                </Content>
            );
        if (cls.isMouldingLineItem())
            return (
                <Content>
                    <MouldingLineItem itemStepUid={stepUid} />
                </Content>
            );
        if (cls?.isServiceLineItem())
            return (
                <Content>
                    <ServiceLineItem itemStepUid={stepUid} />
                </Content>
            );
        return (
            <Content>
                <ComponentsSection key={stepUid} stepUid={stepUid} />
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
            <CollapsibleContent className="flex">
                <motion.div
                    ref={elementRef}
                    // initial={{ opacity: 0 }}
                    // animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    style={{}}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </CollapsibleContent>
        );
    }
    return (
        <div>
            <div className="">
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
    //   const cls = useMemo(() => ctx.cls.hasSelections(), [ctx.cls]);
    const { cls, ...stat } = useMemo(() => {
        const cls = new StepHelperClass(stepUid);
        return {
            cls,
            hasSelection: cls.hasSelections(),
            selectionCount: cls.getTotalSelectionsCount(),
            selectionQty: cls.getTotalSelectionsQty(),
        };
    }, [stepUid]);
    return (
        <CollapsibleTrigger asChild>
            <div className="border border-muted-foreground/20">
                <button
                    className="flex h-8 w-full p-1 gap-4 px-4  space-x-2 items-center text-sm uppercase bg-muted-foreground/5 hover:bg-muted-foreground/20"
                    onClick={(e) => {
                        e.preventDefault();
                        zhtoggleStep(stepUid, zus);
                    }}
                >
                    <Label>{stepForm?.title}</Label>
                    <div className="flex-1"></div>
                    <span className="font-mono">{stepForm.value}</span>
                    {stepForm.price && (
                        <Badge variant="destructive" className="h-5 px-1">
                            ${formatMoney(stepForm.price)}
                        </Badge>
                    )}
                    {stat.hasSelection && (
                        <>
                            <Badge variant="destructive" className="h-5 px-1">
                                selection: {stat.selectionCount}
                            </Badge>
                            <Badge variant="destructive" className="h-5 px-1">
                                qty: {stat.selectionQty}
                            </Badge>
                        </>
                    )}
                    <div className="">
                        <DevOnly>
                            <span>{stepForm?.componentUid}</span>
                            <span>--</span>
                            <span>{stepUid}</span>
                            <span>-</span>
                            <span>{stepForm?.stepId}</span>
                        </DevOnly>
                    </div>
                </button>
            </div>
        </CollapsibleTrigger>
    );
}
