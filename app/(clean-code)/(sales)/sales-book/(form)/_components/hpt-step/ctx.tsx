import { createContext, useContext, useMemo } from "react";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import { HptClass } from "../../_utils/helpers/zus/hpt-class";

export const Context = createContext<ReturnType<typeof useCreateContext>>(
    null as any
);
export const useCtx = () => useContext(Context);

export const useCreateContext = (itemStepUid) => {
    const zus = useFormDataStore();

    const ctx = useMemo(() => {
        return new HptClass(itemStepUid, zus);
    }, [itemStepUid, zus]);
};
