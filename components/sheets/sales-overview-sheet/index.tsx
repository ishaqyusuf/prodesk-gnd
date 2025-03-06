"use client";

import { salesOverviewStore } from "@/app/(clean-code)/(sales)/_common/_components/sales-overview-sheet/store";
import Button from "@/components/common/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useCustomerOverviewQuery } from "@/hooks/use-customer-overview-query";
import { useSalesOverviewQuery } from "@/hooks/use-sales-overview-query";

export default function SalesOverviewSheet() {
    const query = useSalesOverviewQuery();
    const customerQuery = useCustomerOverviewQuery();

    const store = salesOverviewStore();
    if (!query["sales-overview-id"]) return null;

    return (
        <Sheet open onOpenChange={query.close}>
            <SheetContent>
                <SheetHeader>
                    {/* <SalesOverviewModal /> */}
                    <SheetTitle>
                        {store?.overview?.title || "Loading..."}
                    </SheetTitle>
                </SheetHeader>
                <Button
                    onClick={() => {
                        const queryParams = {
                            ...query.params,
                        } as any;
                        query.setParams(null);
                        customerQuery.open("abc", queryParams);
                    }}
                >
                    Customer
                </Button>
            </SheetContent>
        </Sheet>
    );
}
