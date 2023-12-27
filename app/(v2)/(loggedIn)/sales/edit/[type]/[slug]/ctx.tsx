import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import { createContext } from "react";
import { UseFieldArrayReturn } from "react-hook-form";
import { ISalesForm, ISalesFormItem } from "./type";

export interface SalesFormContext {
    data: SalesFormResponse;
    profileEstimate;
    profitRate;
    mockupPercentage;
    toggleMockup;
    taxPercentage;
    setSummary;
    summary;
    discount;
    paymentOption;
    labourCost;
    grandTotal;
    cccPercentage;
    tax;
    subTotal;
    ccc;
}
export const SalesFormContext = createContext<SalesFormContext>({} as any);

export const SalesRowContext = createContext<
    UseFieldArrayReturn<ISalesForm, "items", "id">
>({} as any);
