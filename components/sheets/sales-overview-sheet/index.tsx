"use client";

import SalesOverviewModal from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet";
import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useSalesOverviewQuery } from "@/hooks/use-sales-overview-query";

export default function SalesOverviewSheet() {
    const query = useSalesOverviewQuery();
    const store = salesOverviewStore();
    if (!query["sales-overview-id"]) return null;

    return (
        <Sheet open onOpenChange={(e) => query.setParams(null)}>
            <SheetContent>
                {/* <SalesOverviewModal /> */}
                <SheetTitle title={store?.overview?.title || "Loading..."} />
            </SheetContent>
        </Sheet>
    );
}
