import { create } from "zustand";

import { SalesFormZusData } from "../../../types";
interface SalesFormZusAction {
    init(data);
    newStep(uid, stepUid);
}
export const useFormDataStore = create<SalesFormZusData & SalesFormZusAction>(
    (set) => ({
        data: null as any,
        kvFormItem: null as any,
        kvStepComponent: null as any,
        sequence: null as any,
        kvMultiComponent: null as any,
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
    })
);
