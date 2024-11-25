import { Label } from "@/components/ui/label";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { memo, useEffect, useRef } from "react";
import {
    zhLoadStepComponents,
    zhSelectStepComponent,
} from "../_utils/helpers/zus/zus-step-helper";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";

interface Props {
    stepUid;
}
function Step({ stepUid }: Props) {
    const zus = useFormDataStore();
    // const stepForm = zus.kvStepForm?.[stepUid];
    const components = zus.kvFilteredStepComponentList[stepUid];
    useEffectAfterMount(() => {
        zhLoadStepComponents({
            stepUid,
            zus,
        }).then(() => {});
    }, []);

    return (
        <div>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {components?.map((component) => (
                    <button
                        onClick={(e) => {
                            zhSelectStepComponent({
                                stepUid,
                                zus,
                                id: component.id,
                            });
                        }}
                        key={component.uid}
                    >
                        <Label>{component.title}</Label>
                    </button>
                ))}
            </div>
        </div>
    );
}
export const ComponentsStep = Step; // memo(Step);
