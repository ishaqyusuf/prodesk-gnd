"use client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCustomerOverviewQuery } from "@/hooks/use-customer-overview-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

export function CustomerOverviewSheet() {
    const ctx = useCustomerOverviewQuery();

    useEffect(() => {
        if (ctx.opened) {
            //
        }
    }, [ctx.accountNo, ctx.opened]);
    return (
        <Sheet open={ctx.opened} onOpenChange={ctx.close}>
            <SheetContent></SheetContent>
        </Sheet>
    );
}
