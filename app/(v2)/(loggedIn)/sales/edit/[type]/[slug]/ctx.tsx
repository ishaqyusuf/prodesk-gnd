import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import { createContext } from "react";

export interface SalesFormContext {
    data: SalesFormResponse;
    profileEstimate;
    profitRate;
    mockupPercentage;
}
export const SalesFormContext = createContext<SalesFormContext>({} as any);
