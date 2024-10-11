import {
    createContext,
    useContext,
    useEffect,
    useState,
    useTransition,
} from "react";
import { useDykeComponentStore } from "./data-store";
import { useFieldArray, useForm } from "react-hook-form";
import { OldDykeFormData } from "../../../_common/data-access/sales-form-dta";
import legacyDykeFormHelper from "../_utils/helpers/legacy-dyke-form-helper";
import { DykeStep } from "@/app/(v2)/(loggedIn)/sales-v2/type";

export type LegacyDykeFormType = ReturnType<typeof useLegacyDykeFormContext>;
export const LegacyDykeFormContext = createContext<LegacyDykeFormType>(null);

export const useLegacyDykeForm = () => useContext(LegacyDykeFormContext);
export type LegacyDykeFormItemType = ReturnType<
    typeof useLegacyDykeFormItemContext
>;
export const LegacyDykeFormItemContext =
    createContext<LegacyDykeFormItemType>(null);
export type LegacyDykeFormStepType = ReturnType<
    typeof useLegacyDykeFormStepContext
>;
export const LegacyDykeFormStepContext =
    createContext<LegacyDykeFormStepType>(null);
export const useLegacyDykeFormItem = () =>
    useContext(LegacyDykeFormItemContext);
export const useLegacyDykeFormStep = () =>
    useContext(LegacyDykeFormStepContext);

export function useLegacyDykeFormContext(data: OldDykeFormData) {
    const form = useForm<OldDykeFormData>({
        defaultValues: {
            ...data,
        },
    });
    const [adminMode] = form.watch(["adminMode"]);
    const [loadingStep, startLoadingStep] = useTransition();
    const itemArray = useFieldArray({
        control: form.control,
        name: "itemArray",
    });

    const ctxValue = {
        startLoadingStep,
        form,
        loadingStep,
        itemArray,
        dealerMode: data.dealerMode,
        superAdmin: data.superAdmin,
        status: data.status,
        adminMode,
    };
    return ctxValue;
}

export function useLegacyDykeFormItemContext(rowIndex) {
    const ctx = useLegacyDykeForm();
    return {
        rowIndex,
        mainCtx: ctx,
    };
}

export function useLegacyDykeFormStepContext(stepIndex, step: DykeStep) {
    const ctx = useLegacyDykeForm();
    const itemCtx = useLegacyDykeFormItem();
    const componentsByTitle = useDykeComponentStore(
        (state) => state.loadedComponentsByStepTitle
    );
    const [loading, startLoading] = useTransition();
    const [items, setItems] = useState();
    async function fetchStepComponents() {
        startLoading(async () => {
            const components = await legacyDykeFormHelper.step.loadComponents(
                componentsByTitle,
                stepCtx
            );
        });
    }

    useEffect(() => {
        fetchStepComponents();
    }, []);
    const stepCtx = {
        fetchStepComponents,
        loading,
        mainCtx: ctx,
        itemCtx,
        // itemArray: ctx.itemArray,
        rowIndex: itemCtx.rowIndex,
        step,
        //
    };
    return stepCtx;
}
