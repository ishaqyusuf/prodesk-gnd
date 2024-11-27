import { create } from "zustand";

import { SalesFormZusData } from "../../../../types";
import { stepActions } from "./step-action";
import { FieldPath } from "react-hook-form";
import { dotObject } from "@/app/(clean-code)/_common/utils/utils";
export type ZusSales = SalesFormZusData & SalesFormZusAction;
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
        dotUpdate: (k: FieldPath<SalesFormZusData>, stepSq) =>
            set((state) => {
                const newState = {
                    ...state,
                };
                dotObject.set(k, stepSq, newState);
                return newState;
            }),
        update: (k: keyof SalesFormZusData, value) =>
            set((state) => {
                const newState = { ...state };
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
        ...stepActions(set),
    };
}
export const useFormDataStore = create<ZusSales>((set) => ({
    data: null as any,
    kvFormItem: null as any,
    kvStepForm: null as any,
    sequence: null as any,
    kvMultiComponent: null as any,
    kvFilteredStepComponentList: {},
    kvStepComponentList: {},

    ...fns(set),
}));
