"use client";

import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

export function Info({
  label,
  children,
  hidden,
  className = "",
}: {
  label?;
  hidden?: Boolean;
  children: any;
  className?;
}) {
  if (hidden) return <></>;
  return (
    <div className={cn("grid gap-1", className)}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="">{children}</div>
      {/* <p className="text-muted-foreground">{order.orderId}</p> */}
    </div>
  );
}
