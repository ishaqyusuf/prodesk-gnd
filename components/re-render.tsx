"use client";

import { cn } from "@/lib/utils";
let reRender = 0;
export default function ReRender({
  form,
  className,
  children,
}: {
  form?;
  className?;
  children?;
}) {
  reRender++;
  return (
    <div className={cn("relative", className)}>
      <div className="absolute bg-white z-[99999] m-2 right-0 top-0 text-red-400">
        reRender: {reRender}
      </div>
      {children}
    </div>
  );
}
