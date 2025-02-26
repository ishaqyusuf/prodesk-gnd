"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";

export type GetSalesCustomerSystemData = AsyncFnType<
    typeof _getSalesCustomerSystemData
>;
export const _getSalesCustomerSystemData = async (phoneNo) => {
    //
};
