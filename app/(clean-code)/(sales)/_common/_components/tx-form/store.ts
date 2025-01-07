import { dotObject, dotSet } from "@/app/(clean-code)/_common/utils/utils";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";
import { PaymentMethods } from "../../../types";

export interface Payables {
    id;
    amountDue;
}
const data = {
    paymentMethod: null as PaymentMethods,
    phoneNo: null,
    payables: [] as Payables[],
    totalPay: null,
};
type Action = ReturnType<typeof funcs>;
type Data = typeof data;
type CustomerStore = Data & Action;
export type ZusFormSet = (update: (state: Data) => Partial<Data>) => void;

function funcs(set: ZusFormSet) {
    return {
        initialize: (state) =>
            set(() => ({
                ...data,
                ...state,
            })),
        reset: () =>
            set(() => ({
                ...data,
            })),
        dotUpdate: <K extends FieldPath<Data>>(
            k: K,
            v: FieldPathValue<Data, K>
        ) =>
            set((state) => {
                const newState = {
                    ...state,
                };
                const d = dotSet(newState);
                d.set(k, v);
                return newState;
            }),
    };
}

export const txStore = create<CustomerStore>((set) => ({
    ...data,
    ...funcs(set),
}));
