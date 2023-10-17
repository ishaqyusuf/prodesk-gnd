"use client";

import { getBadgeColor } from "@/lib/status-badge";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface Props {
    status?;
    children?;
    sm?: Boolean;
}
export default function StatusBadge({ status, children, sm }: Props) {
    if (!status) status = children;
    const color = getBadgeColor(status);
    return (
        <Badge
            className={cn(color, "whitespace-nowrap", sm && "p-1 leading-none")}
        >
            {status}
        </Badge>
    );
}
