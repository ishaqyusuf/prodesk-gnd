import { create } from "zustand";

type State = {
    products: any[];
    loadedComponentsByStepTitle: {};
};
type Action = {
    updateProducts: (data) => void;
};
export type IDykeComponentStore = State & Action;
export const useDykeComponentStore = create<IDykeComponentStore>((set) => ({
    products: [],
    loadedComponentsByStepTitle: {},
    updateProducts: (newProducts) => {
        set({
            products: newProducts,
        });
    },
}));
