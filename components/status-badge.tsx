"use client";

import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status;
}
export default function StatusBadge({ status }: Props) {
  const color = getBadgeColor(status);
  return <Badge className={cn(color)}>{status}</Badge>;
}
