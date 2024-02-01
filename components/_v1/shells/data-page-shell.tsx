"use client";

import { DataPageContext } from "@/lib/data-page-context";
import { cn } from "@/lib/utils";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import React from "react";

export function DataPageShell<T>({
    data,
    className,
    children,
}: {
    data?: T;
    children?;
} & PrimitiveDivProps) {
    return (
        <DataPageContext.Provider value={{ data }}>
            <div className={cn(className)}>{children}</div>
        </DataPageContext.Provider>
    );
}
