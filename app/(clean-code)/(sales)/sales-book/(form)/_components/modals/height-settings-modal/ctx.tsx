import { useForm } from "react-hook-form";
import { LegacyDykeFormStepType } from "../../../_hooks/legacy-hooks";
import { useDoor } from "../step-component-modal/use-step-component-modal";

export function useHeightSettingCtx(ctx: LegacyDykeFormStepType) {
    const doorCtx = useDoor(true);
    const stepMeta = ctx.step.step.meta.doorSizeConfig;
    const form = useForm({
        defaultValues: {},
    });
}
