"use client";

import { ISalesOrder } from "@/types/sales";
import { DatePicker } from "../date-range-picker";
import { toast } from "sonner";
import { _updateSalesDate } from "@/app/(auth)/sales/update-sales-date";
import { useEffect, useState } from "react";

interface Props {
    sales: ISalesOrder;
    onUpdate?;
    page?: "invoice" | "overview";
}

export default function UpdateSalesDate({
    sales,
    onUpdate,
    page = "overview"
}: Props) {
    const [date, setDate] = useState(new Date(sales.createdAt as any));
    useEffect(() => {
        setDate(sales.createdAt as any);
    }, []);
    async function updateInvoiceDate(date) {
        // console.log(date);
        setDate(date);
        onUpdate && onUpdate(date);
        if (sales.id && page == "overview") {
            await _updateSalesDate(sales.id, date, sales.orderId, page);
            toast.success("Sales date updated!");
        }
    }
    return (
        <>
            <DatePicker
                setValue={updateInvoiceDate}
                className="w-auto h-8"
                value={new Date(date)}
            />
        </>
    );
}
