"use client";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetContentProps } from "../ui/sheet";
import { cva, VariantProps } from "class-variance-authority";
import { ScrollArea } from "../ui/scroll-area";

const sheetContentVariant = cva("flex flex-col h-screen w-full ", {
    variants: {
        floating: {
            true: "md:h-[96vh] md:mx-4 md:mt-[2vh]",
        },
        rounded: {
            true: "md:rounded-xl",
        },
        size: {
            xl: "sm:max-w-xl",
            default: "",
            lg: "",
        },
    },
});
interface Props
    extends SheetContentProps,
        VariantProps<typeof sheetContentVariant> {
    children?;
    open?: boolean;
    onOpenChange?;
}
export function CustomSheet({ children, open, onOpenChange, ...props }: Props) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                {...props}
                className={cn(
                    sheetContentVariant({
                        ...(props as any),
                    })
                )}
            >
                {children}
            </SheetContent>
        </Sheet>
    );
}
export function CustomSheetContent({ children = null, className = "" }) {
    return (
        <ScrollArea className={cn("flex-1 -mx-6 px-6", className)}>
            {children}
        </ScrollArea>
    );
}
