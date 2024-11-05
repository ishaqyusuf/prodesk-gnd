import React from "react";
import { useDataTableContext, useInifinityDataTable } from "./use-data-table";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/(clean-code)/custom/sheet";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Pencil, X } from "lucide-react";
import { Kbd } from "../kbd";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/_v1/icons";
import { cva, VariantProps } from "class-variance-authority";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";

interface Props {
    // title?: string;
    // titleClassName?: string;
    children?: React.ReactNode;
}
export default function TableItemOverviewSheet({
    children,
}: // title,
// titleClassName,
Props) {
    const { table, selectedRow } = useInifinityDataTable();

    const selectedRowKey =
        Object.keys(table.getState().rowSelection)?.[0] || undefined;

    if (!selectedRowKey || !selectedRow) return null;
    return (
        <Sheet
            open={!!selectedRowKey}
            onOpenChange={(e) => {
                table.toggleAllRowsSelected(false);
            }}
        >
            <SheetContent
                hideClose
                className="sm:max-w-none w-auto overflow-y-autos overflow-hidden p-0 sm:m-8 sm:rounded-xl h-auto"
            >
                <SheetDescription className="sr-only">
                    Selected row details
                </SheetDescription>
                {/* <div className="p-4"> */}
                {children}
                {/* </div> */}
            </SheetContent>
        </Sheet>
    );
}
interface TableSheetHeaderProps {
    titleClassName?;
    title;
}
export function SecondaryTabSheet({
    titleClassName = "",
    title,
    onBack,
    children = null,
}) {
    return (
        <SheetHeader className="border-b p-4">
            <div className="flex gap-2">
                <SheetTitle
                    className={cn(
                        titleClassName,
                        "text-left flex-1 truncate uppercase"
                    )}
                >
                    {title}
                </SheetTitle>
                <div className="flex items-center gap-1 h-7">
                    {children}
                    <Separator orientation="vertical" className="mx-1" />

                    <Button
                        onClick={onBack}
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                    >
                        <Icons.chevronRight className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </div>
        </SheetHeader>
    );
}
export function TableSheetHeader({
    titleClassName,
    title,
}: TableSheetHeaderProps) {
    const { table, selectedRow } = useInifinityDataTable();
    const selectedRowKey =
        Object.keys(table.getState().rowSelection)?.[0] || undefined;

    const index = table
        .getCoreRowModel()
        .flatRows.findIndex((row) => row.id === selectedRowKey);

    const nextId = React.useMemo(
        () => table.getCoreRowModel().flatRows[index + 1]?.id,
        [index, table]
    );

    const prevId = React.useMemo(
        () => table.getCoreRowModel().flatRows[index - 1]?.id,
        [index, table]
    );
    const onPrev = React.useCallback(() => {
        if (prevId) table.setRowSelection({ [prevId]: true });
    }, [prevId, table]);

    const onNext = React.useCallback(() => {
        if (nextId) table.setRowSelection({ [nextId]: true });
    }, [nextId, table]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (!selectedRowKey) return;

            if (e.key === "ArrowUp") {
                e.preventDefault();
                onPrev();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                onNext();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [selectedRowKey, onNext, onPrev]);
    return (
        <SheetHeader className="sticky top-0 border-b bg-background p-4">
            <div className="flex items-center justify-between gap-2">
                <SheetTitle
                    className={cn(titleClassName, "text-left truncate")}
                >
                    {title}
                </SheetTitle>
                <div className="flex items-center gap-1 h-7">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    disabled={!prevId}
                                    onClick={onPrev}
                                >
                                    <ChevronUp className="h-5 w-5" />
                                    <span className="sr-only">Previous</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Navigate <Kbd variant="outline">↑</Kbd>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    disabled={!nextId}
                                    onClick={onNext}
                                >
                                    <ChevronDown className="h-5 w-5" />
                                    <span className="sr-only">Next</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    Navigate <Kbd variant="outline">↓</Kbd>
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* <Button size="icon" variant="outline" className="">
                                <Pencil className="h-5 text-muted-foreground w-5" />
                                <span className="sr-only">Close</span>
                            </Button> */}
                    <Separator orientation="vertical" className="mx-1" />
                    <SheetClose autoFocus={true} asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </SheetClose>
                </div>
            </div>
        </SheetHeader>
    );
}
const contentVariants = cva(``, {
    variants: {
        size: {
            sm: "w-full sm:w-[350px] lg:w-[350px]",
            md: "w-full lg:w-[500px]",
            lg: "w-full lg:w-[700px]",
            xl: "w-full lg:w-[900px]",
            "2xl": "",
        },
    },
    defaultVariants: {
        size: "md",
    },
});
interface SideSheetTabProps
    extends PrimitiveDivProps,
        VariantProps<typeof contentVariants> {
    // side?: SheetContentProps["side"];
}
export function SideSheetContent({}: SideSheetTabProps) {}
