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

export function CustomerOverviewSheet() {
    const ctx = useCustomerOverviewQuery();

    useEffect(() => {
        async function getCustomerData() {}
        if (ctx.opened) {
        }
    }, [ctx.accountNo, ctx.opened]);
    return (
        <Sheet open={ctx.opened} onOpenChange={ctx.close}>
            <SheetContent className="flex flex-col h-screen  w-full sm:max-w-xl md:h-[96vh] md:mx-4 md:rounded-xl  md:mt-[2vh]">
                <SheetHeader>
                    <SheetTitle>Customer Overview</SheetTitle>
                    <SheetDescription>Desc</SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="min-h-screen"></div>
                </ScrollArea>
                <SheetFooter className="flex justify-end">
                    <Button>Save</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
