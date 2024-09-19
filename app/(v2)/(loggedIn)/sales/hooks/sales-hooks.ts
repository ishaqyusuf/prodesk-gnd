import { SalesItem } from "@/data-acces/sales";
import { sum } from "@/lib/utils";
import { useEffect, useState } from "react";
import { sales_TotalDeliverables } from "../utils/sales-helper";

interface SalesStatus {
    payment: {
        status: "paid" | "part paid" | "late" | "pending";
        progress: number;
    };
    production: {
        status: "idle" | "completed" | "in progress" | "late";
        progress: number;
    };
    dispatch: {
        status: "idle" | "completed" | "half way" | "late";
        progress: number;
    };
    productionAssignment: {
        status: "all assigned" | "non assigned";
        progress: number;
    };
}
export function useSalesStatus(item: SalesItem) {
    const [status, setStatus] = useState<SalesStatus>(null);
    useEffect(() => {
        //
        const totalDeliverables = sales_TotalDeliverables(item);
    }, []);

    return {
        status,
    };
}
