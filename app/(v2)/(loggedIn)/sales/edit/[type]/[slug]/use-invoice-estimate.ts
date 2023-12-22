import { ISalesOrder } from "@/types/sales";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function useInvoiceEstimate(index) {
    const form = useFormContext<ISalesOrder>();
    const [qty, price] = form.watch([
        `items.${index}.qty`,
        `item.${index}.price`,
    ]);
    useEffect(() => {}, [qty, price]);
}
