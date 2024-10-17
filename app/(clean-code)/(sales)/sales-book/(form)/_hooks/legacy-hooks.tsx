import {
    createContext,
    useContext,
    useEffect,
    useState,
    useTransition,
} from "react";
import { useDykeComponentStore } from "./data-store";
import {
    FieldPath,
    FieldValues,
    Path,
    useFieldArray,
    useForm,
    UseFormReturn,
} from "react-hook-form";
import {
    DykeFormDataPath,
    DykeFormItemData,
    DykeFormItemDataPath,
    ItemMultiComponentDataPath,
    ItemMultiComponentSizeDataPath,
    OldDykeFormData,
} from "../../../types";
import legacyDykeFormHelper from "../_utils/helpers/legacy-dyke-form-helper";
import { DykeItemForm, DykeStep } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { IStepProducts } from "@/app/(v2)/(loggedIn)/sales-v2/form/components/step-items-list/item-section/step-products";
import useEffectLoader from "@/lib/use-effect-loader";
import { getTaxListUseCase } from "../../../_common/use-case/sales-tax-use-case";
import { generateRandomString } from "@/lib/utils";
import stepHelpers from "../_utils/helpers/step-helper";
import { toast } from "sonner";

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
export type LegacyDoorHPTType = ReturnType<typeof useLegacyDoorHPTContext>;
export const LegacyDoorHPTContext = createContext<LegacyDoorHPTType>(null);
export const useLegacyDoorHPT = () => useContext(LegacyDoorHPTContext);
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
        footerCtx: useLegacyFooter(form),
    };
    return ctxValue;
}
function useLegacyFooter(form: UseFormReturn<OldDykeFormData>) {
    const taxListFieldArray = useFieldArray({
        name: "_taxForm.taxList",
        control: form.control,
    });
    // const taxSelection = form.watch("_taxForm.selection");
    const taxSelectionFieldArray = useFieldArray({
        name: "_taxForm.selection",
        control: form.control,
    });
    // const taxData = useEffectLoader(getTaxListUseCase);
    function removeTaxSelection(code, index) {
        taxSelectionFieldArray.remove(index);
        form.setValue(`_taxForm.taxByCode.${code}.selected`, false);
        setTimeout(() => {
            form.setValue("_taxForm.taxChangedCode", generateRandomString(10));
        }, 500);
    }
    async function changeTax(taxCode) {
        if (!taxCode) {
            removeTaxSelection(taxSelectionFieldArray[0]?.taxCode, 0);
            return;
        }
        const c = taxListFieldArray.fields.find((f) => f.taxCode == taxCode);
        taxSelectionFieldArray.update(0, {
            taxCode: c.taxCode,
            deletedAt: null,
            tax: 0,
            title: c.title,
            percentage: c.percentage,
        });
        form.setValue(`_taxForm.taxByCode.${c.taxCode}.selected`, true);
        form.setValue(
            `_taxForm.taxByCode.${c.taxCode}.data.taxCode`,
            c.taxCode
        );
        form.setValue(`_taxForm.taxByCode.${c.taxCode}._tax`, c);
        setTimeout(() => {
            form.setValue("_taxForm.taxChangedCode", generateRandomString(10));
        }, 500);
    }
    return {
        taxListFieldArray,
        removeTaxSelection,
        changeTax,
        taxSelectionFieldArray,
    };
}
export function useLegacyDykeFormItemContext(rowIndex) {
    const ctx = useLegacyDykeForm();

    const rootPath: DykeFormDataPath = `itemArray.${rowIndex}`;
    const formStepPath: DykeFormItemDataPath = `item.formStepArray`;
    // const multiComponentRootPath: DykeFormItemDataPath = `multiComponent`;
    // const multiComponentPath: ItemMultiComponentDataPath = ''
    const componentsPath: DykeFormItemDataPath = "multiComponent.components";
    const _ = {
        rootPath,
        formStepPath,
        formSteps: () => ctx.form.getValues(`${rootPath}.${formStepPath}`),
        rowIndex,
        mainCtx: ctx,
        getPath: {
            item(path: DykeFormItemDataPath) {
                return `${rootPath}.${path}`;
            },
            componentItem(title, path: ItemMultiComponentDataPath) {
                return `${rootPath}.${componentsPath}.${title}.${path}`;
            },
            doorSize(title, size, path: ItemMultiComponentSizeDataPath) {
                return `${rootPath}.${componentsPath}.${title}.${size}.${path}`;
            },
        },
        get: {},
    };
    return _;
}

export function useLegacyDykeFormStepContext(stepIndex, _step: DykeStep) {
    const [step, setStep] = useState(_step);
    const ctx = useLegacyDykeForm();
    const itemCtx = useLegacyDykeFormItem();
    const componentsByTitle = useDykeComponentStore(
        (state) => state.loadedComponentsByStepTitle
    );
    const [sortMode, setSortMode] = useState(false);
    const updateComponent = useDykeComponentStore(
        (state) => state.updateComponent
    );
    const [filteredComponents, setFilteredComponents] = useState<IStepProducts>(
        []
    );
    const [components, setComponents] = useState<IStepProducts>([]);
    const [deletedComponents, setDeletedComponents] = useState<IStepProducts>(
        []
    );
    // const [_components,_setComponents] = use
    const [loading, startLoading] = useTransition();

    async function fetchStepComponents() {
        startLoading(async () => {
            const { cache, data, key } =
                await legacyDykeFormHelper.step.loadComponents(
                    componentsByTitle,
                    stepCtx
                );
        });
    }
    async function reloadComponents() {
        startLoading(async () => {
            const { cache, data, key } =
                await legacyDykeFormHelper.step.loadComponents(
                    componentsByTitle,
                    stepCtx,
                    true
                );
        });
    }
    useEffect(() => {
        fetchStepComponents();
    }, []);
    const formStepRootPath = itemCtx.getPath.item(
        `item.formStepArray.${stepIndex}`
    ) as any;
    async function updateStep(stepForm) {
        setStep(stepForm);

        ctx.form.setValue(formStepRootPath, stepForm);
        reloadComponents();
    }

    const [stepValue, allowAdd, allowCustom] = ctx.form.watch([
        `${formStepRootPath}.step.value`,
        `${formStepRootPath}.step.meta.allowAdd`,
        `${formStepRootPath}.step.meta.allowCustom`,
    ] as any);

    const watch = {
        stepValue,
        sortMode,
        allowAdd,
        allowCustom,
    };
    const stepCtx = {
        deletedComponents,
        sortToggle() {
            if (sortMode) {
                stepHelpers.finishSort(stepCtx);
                toast.success("Saved");
            }
            setSortMode(!sortMode);
        },
        updateStep,
        reloadComponents,
        setDeletedComponents,
        fetchStepComponents,
        updateComponent,
        filteredComponents,
        setFilteredComponents,
        loading,
        mainCtx: ctx,
        itemCtx,
        // itemArray: ctx.itemArray,
        rowIndex: itemCtx.rowIndex,
        step,
        components,
        setComponents,
        stepIndex,
        isRoot: step.step.title == "Item Type",
        isDoor: step.step.title == "Door",
        isMoulding: step.step.title == "Moulding",
        watch,
    };
    return stepCtx;
}
export function useLegacyDoorHPTContext(title) {
    const itemCtx = useLegacyDykeFormItem();
    const formSteps = itemCtx.formSteps();
    const doorStepIndex = formSteps.findIndex((i) => i.step.title == "Door");
    if (!doorStepIndex) throw new Error("Door Not found");
    const doorStepCtx = useLegacyDykeFormStepContext(
        doorStepIndex,
        formSteps[doorStepIndex] as any
    );

    const [showSelection, setShowSelection] = useState(false);
    async function changeDoor() {}
    return {
        doorStepCtx,
    };
    // const rootPath =
    // const k: FieldPath<OldDykeFormData> = "_rawData.billingAddress.city";
}
