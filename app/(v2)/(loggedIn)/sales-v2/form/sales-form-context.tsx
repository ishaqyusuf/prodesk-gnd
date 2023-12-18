import { Dispatch, SetStateAction, createContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { IDykeSalesItem } from "../type";

export const SalesFormContext = createContext<SalesFormContextType>({} as any);
export interface SalesFormContextType {
    openBlock;
    setOpenBlock: Dispatch<any>;
    setBlocks: Dispatch<SetStateAction<never[]>>;
    blocks;
    rowIndex;
    openIndex: Dispatch<any>;
    setOpen;
    configIndex;
    nextBlock(label, value);
    form: UseFormReturn<{
        items: IDykeSalesItem[];
    }>;
}
