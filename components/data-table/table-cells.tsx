"use client";

import { DateFormats, formatDate } from "@/lib/use-day";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
    children?;
    className?;
}
function Cell({ children }) {
    return <div>{children}</div>;
}
function Primary({ children, className }: Props) {
    return <div className={cn("font-semibold", className)}>{children}</div>;
}
function Secondary({ children, className }: Props) {
    return (
        <div className={cn("text-muted-foreground", className)}>{children}</div>
    );
}
function Date({
    children,
    className,
    format = "MM/DD/YY",
}: Props & {
    format?: DateFormats;
}) {
    return <div className={cn(className)}>{formatDate(children)}</div>;
}
function Money({
    value,
    validOnly,
    className,
}: {
    value?;
    validOnly?;
    className?: string;
}) {
    if (!value) value = 0;
    if (!value && validOnly) return null;
    return (
        <span className={cn(className)}>{formatCurrency.format(value)}</span>
    );
}
export let TableCol = Object.assign(Cell, {
    Primary,
    Secondary,
    Money,
    Date,
});
