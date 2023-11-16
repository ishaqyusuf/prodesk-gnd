"use client";

import { ISalesOrder } from "@/types/sales";
import { DatePicker } from "../date-range-picker";
import { toast } from "sonner";
import { _updateSalesDate } from "@/app/(auth)/sales/update-sales-date";

interface Props {
    sales: ISalesOrder;
}

export default function UpdateSalesDate({ sales }: Props) {
    async function updateInvoiceDate(date) {
        console.log(date);
        await _updateSalesDate(sales.id, date, sales.orderId, "overview");
        toast.success("Sales date updated!");
    }
    return (
        <>
            <DatePicker
                setValue={updateInvoiceDate}
                className="w-auto h-8"
                value={new Date(sales.createdAt as any)}
            />
        </>
    );
}
