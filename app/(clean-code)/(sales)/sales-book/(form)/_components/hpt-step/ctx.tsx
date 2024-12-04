import { createContext, useContext, useEffect, useMemo } from "react";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import { HptClass } from "../../_utils/helpers/zus/hpt-class";

export const Context = createContext<ReturnType<typeof useCreateContext>>(
    null as any
);
export const useCtx = () => useContext(Context);

export const useCreateContext = (itemStepUid) => {
    const zus = useFormDataStore();

    const ctx = useMemo(() => {
        console.log("HPT CTX REFRESHED");
        const ctx = new HptClass(itemStepUid, zus);
        // const set = zus.set
        const itemForm = ctx.getItemForm();
        return {
            ctx,
            itemForm,
            ...ctx.getHptForm(),
        };
    }, [
        itemStepUid,
        // itemStepUid, zus
    ]);
    useEffect(() => {
        // console.log(ctx.getSelectedDoors());
    }, []);
    return {
        ...ctx,
        zus,
    };
};
