import { IJobs } from "@/types/hrm";
import { InstallCostLine } from "@/types/settings";
import { createContext } from "react";
import { UseFormReturn } from "react-hook-form";

interface IContext {
    form: UseFormReturn<IJobs>;
    calculateTasks;
    setCostList;
    costList: InstallCostLine[];
}
export const SubmitModalContext = createContext<IContext>({} as any);
