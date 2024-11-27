import { useState } from "react";
import Link from "next/link";
import { DropdownMenuItemProps } from "@radix-ui/react-dropdown-menu";
import { PrimitiveDivProps } from "@/types/type";
import { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { IconKeys, Icons } from "@/components/_v1/icons";
import { cn } from "@/lib/utils";

type MenuItemProps = {
    link?;
    href?;
    Icon?;
    SubMenu?;
    _blank?: Boolean;
    icon?: IconKeys;
} & DropdownMenuItemProps;
interface RowActionMoreMenuProps {
    children;
    disabled?: boolean;
    label?;
    Icon?;
    Trigger?;
    noSize?: boolean;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    open?;
    onOpenChanged?;
}
function BaseMenu({
    children,
    Icon = Icons.Menu,
    label,
    disabled,
    Trigger,
    noSize,
    open,
    onOpenChanged,
    variant = "outline",
}: RowActionMoreMenuProps) {
    const [_open, _onOpenChanged] = useState(open);
    return (
        <DropdownMenu
            open={onOpenChanged ? open : _open}
            onOpenChange={(e) => {
                _onOpenChanged(e);
                onOpenChanged?.(e);
            }}
        >
            <DropdownMenuTrigger asChild>
                {Trigger ? (
                    Trigger
                ) : (
                    <Button
                        disabled={disabled}
                        variant={variant}
                        className={cn(
                            "flex h-8 space-x-4",
                            !label && "w-8 p-0",
                            variant == "default"
                                ? "data-[state=open]:bg-muted-foreground"
                                : "data-[state=open]:bg-muted"
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        {label && <span className="">{label}</span>}
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn(!noSize && "w-[185px]")}
            >
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
function Item({
    link,
    href,
    children,
    Icon,
    SubMenu,
    onClick,
    _blank,
    icon,
    ...props
}: MenuItemProps) {
    if (!Icon && icon) Icon = Icons[icon];
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
function LinkableNode({
    href,
    As,
    children,
    _blank,
    ...props
}: PrimitiveDivProps & { href?; className?; As?; _blank?: Boolean }) {
    if (href)
        return (
            <Link
                {...(props as any)}
                className={cn("hover:underline", props?.className)}
                target={_blank && "_blank"}
                href={href}
            >
                {children}
            </Link>
        );
    return <div {...props}>{children}</div>;
}
export let Menu = Object.assign(BaseMenu, {
    Item,
    Label: DropdownMenuLabel,
    Separator: DropdownMenuSeparator,
});
