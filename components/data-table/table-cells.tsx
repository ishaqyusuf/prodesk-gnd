"use client";

import { DateFormats, formatDate } from "@/lib/use-day";
import { cn, formatCurrency } from "@/lib/utils";
import { useState, useTransition } from "react";
import { Icons } from "../_v1/icons";
import { Button, ButtonProps } from "../ui/button";
import { toast } from "sonner";
import { MenuItem } from "../_v1/data-table/data-table-row-actions";
import { DropdownMenuShortcut } from "../ui/dropdown-menu";

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
function DeleteRow({
    action,
    data,
    disabled,
    menu,
    deleteKey = "id",
}: {
    action;
    data;
    disabled?: boolean;
    menu?: Boolean;
    deleteKey?: string;
}) {
    const [confirm, setConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const Icon = confirm ? Icons.Warn : isPending ? Icons.spinner : Icons.trash;
    function _delete(e) {
        e.preventDefault();
        if (!confirm) {
            setConfirm(true);
            setTimeout(() => {
                setConfirm(false);
            }, 3000);
            return;
        }
        setConfirm(false);
        startTransition(async () => {
            toast.promise(
                async () => {
                    if (action) {
                        await action(data[deleteKey]);
                    }
                    // revalidatePath("");
                },
                {
                    loading: `Deleting`, // ${row.type} #${row.orderId}`,
                    success(data) {
                        return "Deleted Successfully";
                    },
                    error: "Unable to completed Delete Action",
                }
            );
        });
    }
    if (!menu)
        return (
            <Button
                variant="outline"
                disabled={isPending || disabled}
                className="flex h-8 w-8 p-0 text-red-500 hover:text-red-600"
                onClick={_delete}
            >
                <Icon
                    className={`${
                        isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                    }`}
                />
                <span className="sr-only">Delete</span>
            </Button>
        );
    return (
        <MenuItem
            disabled={isPending || disabled}
            className="text-red-500 hover:text-red-600"
            onClick={_delete}
        >
            <Icon
                className={`mr-2 ${
                    isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                }`}
            />
            {confirm ? "Sure?" : isPending ? "Deleting" : "Delete"}
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </MenuItem>
    );
}
function Btn({
    icon,
    onClick,
    disabled,
    children,
    className,
    ...props
}: {
    icon?: keyof typeof Icons;
    onClick?;
    disabled?: boolean;
    children?;
} & ButtonProps) {
    const Icon = Icons[icon as any];
    return (
        <Button
            variant="outline"
            disabled={disabled}
            className={cn("flex h-8 px-2", !children && "w-8 px-0", className)}
            onClick={onClick}
            {...props}
        >
            {Icon && <Icon className={cn("h-4 w-4", children && "mr-2")} />}
            {children}
        </Button>
    );
}
export let TableCol = Object.assign(Cell, {
    Primary,
    Btn,
    Secondary,
    Money,
    Date,
    DeleteRow,
});
