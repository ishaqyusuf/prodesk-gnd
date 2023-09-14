"use client";

import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status?;
  children?;
}
export default function StatusBadge({ status, children }: Props) {
  const color = getBadgeColor(status || children);
  return <Badge className={cn(color)}>{status || children}</Badge>;
}
