import { QueryTabs } from "@/use-cases/query-tab-use-case";
import { create } from "zustand";

type State = {
    allTabs: QueryTabs;
    pageTabs;
    currentPageQuery;
};
type Action = {
    update(key: keyof IQueryTabStore, data);
};

export type IQueryTabStore = State & Action;
export const useQueryTabStore = create<IQueryTabStore>((set) => ({
    allTabs: [],
    pageTabs: [],
    currentPageQuery: null,
    update(key: keyof IQueryTabStore, data) {
        set((state) => ({
            [key]: data,
        }));
    },
}));
