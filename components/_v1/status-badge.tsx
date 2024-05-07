"use client";

import { _getStatusColor, getBadgeColor } from "@/lib/status-badge";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface Props {
    status?;
    children?;
    sm?: Boolean;
    color?;
}
export default function StatusBadge({ status, color, children, sm }: Props) {
    if (!status) status = children;
    const _color = getBadgeColor(status);
    return (
        <Badge
            className={cn(
                color ? _getStatusColor(color) : _color,
                "whitespace-nowrap",
                sm && "p-1 leading-none"
            )}
        >
            {status}
        </Badge>
    );
}
