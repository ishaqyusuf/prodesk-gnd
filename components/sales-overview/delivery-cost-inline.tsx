"use client";

import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";

import { InfoLine } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/tabs/sales-info-tab";

import { useState } from "react";
import { DatePicker } from "../_v1/date-range-picker";

export function DeliveryCostInline() {
    const store = salesOverviewStore();
    const overview = store.overview;
    async function updateDate(value) {
        // await updateSalesDeliveryCostAction(overview.id, Number(value));
        // refreshTabData(store.currentTab);
        // revalidateTable();
    }
    const [value, setValue] = useState(store.overview?.createdAt);
    return (
        <InfoLine
            label="Date Created"
            value={
                <DatePicker
                    // disabled={(date) => date > new Date()}
                    setValue={updateDate}
                    className="w-auto h-8"
                    value={value}
                />
            }
        ></InfoLine>
    );
}
