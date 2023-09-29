"use client";

import { cn } from "@/lib/utils";
import { store, useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DataPageShell<T>({
    data,
    className,
    children
}: {
    data?: T;
    children?;
} & PrimitiveDivProps) {
    const id = usePathname();
    const dataP = useAppSelector(state => state.slicers?.dataPage);
    useEffect(() => {
        dispatchSlice("dataPage", {
            id,
            data
        });
    }, [data, id]);
    console.log(dataP?.id, id);
    if (id != dataP?.id) {
        return null;
    }
    return <div className={cn(className)}>{children}</div>;
}
