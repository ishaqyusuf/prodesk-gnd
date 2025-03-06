"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useCustomerOverviewQuery } from "@/hooks/use-customer-overview-query";
import { useEffect } from "react";
import { CustomSheet, CustomSheetContent } from "../custom-sheet-content";

export function CustomerOverviewSheet() {
    const ctx = useCustomerOverviewQuery();

    useEffect(() => {
        async function getCustomerData() {}
        if (ctx.opened) {
        }
    }, [ctx.accountNo, ctx.opened]);
    return (
        <CustomSheet
            open={ctx.opened}
            rounded
            size="xl"
            onOpenChange={ctx.close}
        >
            <SheetHeader>
                <SheetTitle>Customer Overview</SheetTitle>
                <SheetDescription>Desc</SheetDescription>
            </SheetHeader>
            <CustomSheetContent>
                <div className="min-h-screen"></div>
            </CustomSheetContent>
            <SheetFooter className="flex justify-end">
                <Button>Save</Button>
            </SheetFooter>
        </CustomSheet>
    );
}
