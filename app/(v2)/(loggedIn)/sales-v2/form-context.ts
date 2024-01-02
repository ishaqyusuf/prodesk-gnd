import { createContext } from "react";
import { DykeForm, IDykeFormContext } from "./type";
import { useFormContext } from "react-hook-form";
import { IDykeItemFormContext } from "./use-dyke-item";

export const DykeFormContext = createContext<IDykeFormContext>({} as any);
export const DykeItemFormContext = createContext<IDykeItemFormContext>(
    {} as any
);

export const useDykeForm = () => useFormContext<DykeForm>();
