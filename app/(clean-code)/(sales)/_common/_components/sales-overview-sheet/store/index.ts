import { dotObject, dotSet } from "@/app/(clean-code)/_common/utils/utils";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";

const data = {
    salesUID: null,
    overview: null,
    itemOverview: null,
    payment: null,
    shipping: null,
    notification: null,
};
type Action = ReturnType<typeof funcs>;
type Data = typeof data;
type CustomerStore = Data & Action;
export type ZusFormSet = (update: (state: Data) => Partial<Data>) => void;

function funcs(set: ZusFormSet) {
    return {
        update: <K extends FieldPath<Data>>(k: K, v: FieldPathValue<Data, K>) =>
            set((state) => {
                const newState = {
                    ...state,
                };
                const d = dotSet(newState);
                d.set(k, v);
                return newState;
            }),
        reset: ({ salesUID }) =>
            set((state) => ({
                ...data,
                salesUID,
            })),
    };
}
export const salesOverviewStore = create<CustomerStore>((set) => ({
    ...data,
    ...funcs(set),
}));
