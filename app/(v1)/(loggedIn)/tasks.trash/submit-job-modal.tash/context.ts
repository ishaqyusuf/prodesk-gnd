import { IJobs } from "@/types/hrm";
import { InstallCostLine } from "@/types/settings";
import { createContext } from "react";
import { UseFormReturn } from "react-hook-form";

interface IContext {
    form: UseFormReturn<IJobs>;
    calculateTasks;
    setCostList;
    prevTab;
    setTab;
    setPrevTab;
    tab;
    search;
    techEmployees;
    resetFields;
    _changeWorker;
    _setTab;
    admin;
    unitCosting;
    isPunchout(): boolean;
    costList: InstallCostLine[];
}
export const SubmitModalContext = createContext<IContext>({} as any);
