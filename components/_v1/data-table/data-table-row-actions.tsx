"use client";

import { Info, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import Link from "next/link";
import { Fragment, useTransition } from "react";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useRouter } from "next/navigation";
import { useBool } from "@/lib/use-loader";

import { Icons } from "../icons";
import { toast } from "sonner";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import LinkableNode from "../link-node";
import {
    DropdownMenuItemProps,
    PrimitiveButtonProps,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export function RowActionCell({ children }: { children? }) {
    return (
        <div className="flex justify-end items-center space-x-2">
            {children}
        </div>
    );
}
export function RowActionMoreMenu({
    children,
    Icon = MoreHorizontal,
    label,
    disabled,
    Trigger,
    variant = "outline",
}: {
    children;
    disabled?: boolean;
    label?;
    Icon?;
    Trigger?;
    variant?;
}) {
    // const [open,onOpenChange] =
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {Trigger ? (
                    Trigger
                ) : (
                    <Button
                        disabled={disabled}
                        variant={variant}
                        className={cn(
                            "flex h-8 space-x-4 data-[state=open]:bg-muted",
                            !label && "w-8 p-0"
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        {label && <span className="">{label}</span>}
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[185px]">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
export const Menu = RowActionMoreMenu;
export function RowActionMenuItem({
    link,
    href,
    children,
    Icon,
    SubMenu,
    onClick,
    _blank,
    ...props
}: {
    link?;
    href?;
    Icon?;
    SubMenu?;
    _blank?: Boolean;
} & PrimitiveDivProps &
    DropdownMenuItemProps) {
    if (SubMenu)
        return (
            <DropdownMenuSub {...props}>
                <DropdownMenuSubTrigger>
                    {Icon && (
                        <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    )}
                    {children}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>{SubMenu}</DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    const Frag = () => (
        <DropdownMenuItem
            {...props}
            onClick={link || href ? null : (onClick as any)}
        >
            {Icon && (
                <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            )}
            {children}
        </DropdownMenuItem>
    );
    if (link || href)
        return (
            <LinkableNode _blank={_blank} href={link || href}>
                <Frag />
            </LinkableNode>
        );
    return <Frag />;
}
export const MenuItem = RowActionMenuItem;
export function ActionButton({
    Icon,
    label,
    className,
    ...props
}: PrimitiveButtonProps & {
    Icon?;
    label?;
}) {
    if (Icon)
        return (
            <Button
                variant="outline"
                className={cn("flex h-8 w-8 p-0", className)}
                {...props}
            >
                <Icon className={`h-4 w-4`} />
                <span className="sr-only">{label}</span>
            </Button>
        );
}
interface DeleteRowActionProps {
    row: any;
    action;
    deleteKey?;
    menu?: boolean;
    disabled?: boolean;
    noRefresh?: boolean;
    noToast?: boolean;
}

export const EditRowAction = typedMemo(
    ({
        onClick,
        menu,
        disabled,
    }: { menu?: boolean } & PrimitiveButtonProps) => {
        const [isPending, startTransition] = useTransition();
        const router = useRouter();

        function _edit(e) {
            onClick && onClick(e);
        }
        if (!menu)
            return (
                <Button
                    variant="outline"
                    disabled={isPending || disabled}
                    className="flex h-8 w-8 p-0 "
                    onClick={_edit}
                >
                    <Icons.edit
                        className={`${
                            isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                        }`}
                    />
                    <span className="sr-only">Delete</span>
                </Button>
            );
        return (
            <DropdownMenuItem
                disabled={isPending || disabled}
                className=""
                onClick={_edit}
            >
                <Icons.edit
                    className={`mr-2 ${
                        isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                    }`}
                />

                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
        );
    }
);
export const DeleteRowAction = typedMemo(
    ({
        row,
        action,
        menu,
        noRefresh,
        deleteKey = "id",
        disabled,
        noToast,
    }: DeleteRowActionProps) => {
        const [isPending, startTransition] = useTransition();
        const router = useRouter();
        const confirm = useBool();
        async function deleteOrder(e) {
            e.preventDefault();
            if (!confirm.bool) {
                confirm.setBool(true);
                setTimeout(() => {
                    confirm.setBool(false);
                }, 3000);
                return;
            }
            confirm.setBool(false);
            startTransition(async () => {
                if (noToast) {
                    if (action) {
                        await action(row[deleteKey]);
                        if (!noRefresh) router.refresh();
                    }
                } else
                    toast.promise(
                        async () => {
                            if (action) {
                                await action(row[deleteKey]);
                                if (!noRefresh) router.refresh();
                            }
                            // revalidatePath("");
                        },
                        {
                            loading: `Deleting ${row.type} #${row.orderId}`,
                            success(data) {
                                return "Deleted Successfully";
                            },
                            error: "Unable to completed Delete Action",
                        }
                    );
            });
        }

        const Icone: any = confirm.bool
            ? Info
            : isPending
            ? Icons.spinner
            : Trash;
        if (!menu)
            return (
                <Button
                    variant="outline"
                    disabled={isPending || disabled}
                    className="flex h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    onClick={deleteOrder}
                >
                    <Icone
                        className={`${
                            isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                        }`}
                    />
                    <span className="sr-only">Delete</span>
                </Button>
            );
        return (
            <DropdownMenuItem
                disabled={isPending || disabled}
                className="text-red-500 hover:text-red-600"
                onClick={deleteOrder}
            >
                <Icone
                    className={`mr-2 ${
                        isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                    }`}
                />
                {confirm.bool ? "Sure?" : isPending ? "Deleting" : "Delete"}
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
        );
    }
);
