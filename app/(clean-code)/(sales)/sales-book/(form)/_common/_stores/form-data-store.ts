import { create } from "zustand";

import { SalesFormZusData } from "../../../../types";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { dotObject } from "@/app/(clean-code)/_common/utils/utils";
export type ZusSales = SalesFormZusData & SalesFormZusAction;
export type ZusComponent = ZusSales["kvStepComponentList"][number][number];
export type ZusStepFormData = ZusSales["kvStepForm"][number];
export type ZusItemFormData = ZusSales["kvFormItem"][number];
export type ZusGroupItem = ZusItemFormData["groupItem"];
export type ZusGroupItemForm = ZusItemFormData["groupItem"]["form"];
export type ZusGroupItemFormPath = ZusGroupItemForm[string];
type SalesFormZusAction = ReturnType<typeof fns>;
export type SalesFormSet = (
    update: (state: SalesFormZusData) => Partial<SalesFormZusData>
) => void;
function fns(set: SalesFormSet) {
    return {
        init: (data) =>
            set((state) => {
                return {
                    ...state,
                    ...data,
                    oldFormState: JSON.parse(
                        JSON.stringify({
                            kvFormItem: data.kvFormItem,
                            kvMultiComponent: data.kvMultiComponent,
                            kvStepForm: data.kvStepForm,
                            metaData: data.metaData,
                        })
                    ),
                };
            }),
        newStep: (itemUid, stepUid) =>
            set((state) => {
                const newState = { ...state };
                newState.sequence.stepComponent[itemUid].push(stepUid);
                return newState;
            }),
        toggleItem: (itemUid) =>
            set((state) => {
                const newState = { ...state };
                newState.kvFormItem[itemUid].collapsed =
                    !newState.kvFormItem[itemUid].collapsed;
                return newState;
            }),

        dotUpdate: <K extends FieldPath<SalesFormZusData>>(
            k: K,
            stepSq //: FieldPathValue<SalesFormZusData, K>
        ) =>
            set((state) => {
                const newState = {
                    ...state,
                };
                dotObject.set(k, stepSq, newState);
                return newState;
            }),
        update: (k: keyof SalesFormZusData, value) =>
            set((state) => {
                const newState: any = { ...state };
                newState[k] = value;

                return newState;
            }),
        updateFormItem: (
            uid,
            k: keyof SalesFormZusData["kvFormItem"][number],
            value
        ) =>
            set((state) => {
                const newState = { ...state };
                (newState.kvFormItem[uid] as any)[k] = value as any;
                return newState;
            }),
        removeItem: (uid, index) =>
            set((state) => {
                const newState = { ...state };
                newState.sequence.formItem.splice(index, 1);
                return newState;
            }),
    };
}
export const useFormDataStore = create<ZusSales>(
    (set) =>
        ({
            ...fns(set),
        } as any)
);
export const getFormState = () => useFormDataStore.getState();
