import { dotObject, dotSet } from "@/app/(clean-code)/_common/utils/utils";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";
import {
    GetCustomerOverviewUseCase,
    GetCustomersSelectListUseCase,
} from "../../use-case/customer-use-case";

const defaultValues = {
    selections: {} as {
        [id in string]: {
            id: number;
            amount: number;
            checked: boolean;
        };
    },
    total: 0,
    loading: true,
    phoneNo: null,
    customersList: [] as GetCustomersSelectListUseCase,
};
const data: GetCustomerOverviewUseCase & typeof defaultValues = {
    ...defaultValues,
} as any;
type Action = ReturnType<typeof funcs>;
type Data = typeof data;
type CustomerStore = Data & Action;
export type ZusFormSet = (update: (state: Data) => Partial<Data>) => void;

function funcs(set: ZusFormSet) {
    return {
        tabChanged: (tab) =>
            set((state) => {
                return {
                    ...state,
                    tab,
                };
            }),
        clear: (phoneNo?) =>
            set((state) => {
                return {
                    ...data,

                    phoneNo,
                };
            }),
        initialize: (data) =>
            set((state) => {
                return {
                    loading: false,
                    ...data,
                };
            }),
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
export const customerStore = create<CustomerStore>((set) => ({
    ...data,
    ...funcs(set),
}));
