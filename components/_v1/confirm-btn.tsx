"use client";

import { Button, ButtonProps } from "../ui/button";
import { cn } from "@/lib/utils";
import { useBool } from "@/lib/use-loader";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Info, Trash } from "lucide-react";
import { Icons } from "./icons";

interface Props extends ButtonProps {
    Icon?;
    trash?: Boolean;
    variant?: ButtonProps["variant"];
}

export default function ConfirmBtn({
    className,
    Icon,
    size,
    onClick,
    trash,
    variant = "ghost",
    children,
    ...props
}: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const confirm = useBool();
    async function _onClick(e) {
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
            onClick && (await onClick(e));
        });
    }
    const Icone: any = confirm.bool
        ? Info
        : isPending
        ? Icons.spinner
        : size == "icon"
        ? Trash
        : Icon;
    return (
        <Button
            size={size}
            disabled={isPending}
            onClick={_onClick}
            variant={variant}
            className={cn(
                className,
                size == "icon" && "h-8 w-8 p-0",
                trash && "text-red-500 hover:text-red-600"
            )}
            {...props}
        >
            {Icone && (
                <Icone
                    className={`${
                        isPending ? "h-3.5 w-3.5 animate-spin" : "h-4 w-4"
                    }`}
                />
            )}
            {children && <div className={cn(Icone && "ml-2")}>{children}</div>}
        </Button>
    );
}
