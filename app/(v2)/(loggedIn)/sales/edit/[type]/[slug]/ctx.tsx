import { SalesFormResponse } from "@/app/(auth)/sales/_actions/get-sales-form";
import { createContext } from "react";

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
    cccPayment;
    cccPercentage;
    tax;
    subTotal;
    ccc;
}
export const SalesFormContext = createContext<SalesFormContext>({} as any);
