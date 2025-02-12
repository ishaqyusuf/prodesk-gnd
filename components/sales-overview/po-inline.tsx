"use client";

import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";

import { InlineTextEditor } from "../inline-text-editor";
import Money from "../_v1/money";
import { InfoLine } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/tabs/sales-info-tab";

export function PoInline() {
    const store = salesOverviewStore();
    const overview = store.overview;

    return (
        <InfoLine
            label="P.O No."
            value={
                <InlineTextEditor className="w-24" value={overview?.po}>
                    {overview?.po || "Click to add"}
                </InlineTextEditor>
            }
        ></InfoLine>
    );
}
