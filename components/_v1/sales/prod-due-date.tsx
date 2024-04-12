"use client";

import { formatDate } from "@/lib/use-day";
import { ISalesOrder } from "@/types/sales";
import { useState } from "react";
import { DatePicker } from "../date-range-picker";
import { updateProductionDate } from "@/app/(v1)/_actions/sales/sales-production";
import { toast } from "sonner";

export default function ProductionDueDate({
    data,
    editable,
    hideIcon,
}: {
    data: ISalesOrder;
    editable?: Boolean;
    hideIcon?: Boolean;
}) {
    const [date, setDate] = useState(data.prodDueDate);
    if (!editable) return <p>{formatDate(date)}</p>;

    return (
        <div className="inline-flex">
            <DatePicker
                className="h-8 w-auto"
                hideIcon={hideIcon}
                format="MM/DD/YY"
                value={date}
                setValue={async (value) => {
                    await updateProductionDate(data.id, value);
                    setDate(value);
                    toast.success("Production Due Date Updated!");
                }}
            />
        </div>
    );
}
