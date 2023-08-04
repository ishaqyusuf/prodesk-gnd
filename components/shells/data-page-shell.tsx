"use client";

import { cn } from "@/lib/utils";
import { store, useAppSelector } from "@/store";
import { updateSlice } from "@/store/slicers";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DataPageShell<T>({
  data,
  className,
  children,
}: {
  data: T;
  children?;
  className?;
}) {
  const id = usePathname();
  const dataP = useAppSelector((state) => state.slicers.dataPage);
  useEffect(() => {
    store.dispatch(
      updateSlice({
        key: "dataPage",
        data: {
          id,
          data,
        },
      })
    );
  }, [data]);
  if (id != dataP?.id) return null;
  return <div className={cn(className)}>{children}</div>;
}
