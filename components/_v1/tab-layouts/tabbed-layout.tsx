"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ISidebar, nav } from "@/lib/navs";
import { Button } from "../../ui/button";
import Link from "next/link";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { PrimitiveDivProps } from "@/types/type";
import { timeout } from "@/lib/timeout";
import Portal from "../portal";

export default function TabbedLayout({
    children,
    tabKey,
    tabs = [],
    className,
}: {
    tabs?: {
        path;
        title;
    }[];
    tabKey?: keyof ISidebar;
} & PrimitiveDivProps) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });
    const _nav = nav(session);
    const path = usePathname();
    const [tab, setTab] = useState<any>(path);

    return (
        <div className="space-y-4 ">
            <Portal nodeId={"tab"}>
                <div className="flex ">
                    {(tabKey ? _nav?.[tabKey] : tabs).map((c, i) => (
                        <div className="flex flex-col" key={i}>
                            <Button
                                size="sm"
                                className={cn(
                                    "p-1 h-8 px-4",
                                    c.path != tab && "text-muted-foreground"
                                )}
                                variant={c.path == tab ? "ghost" : "ghost"}
                                asChild
                            >
                                <Link href={c.path}>{c.title}</Link>
                            </Button>
                            <div
                                className={cn(
                                    "h-0.5 w-full mt-1",
                                    c.path == tab && "bg-primary"
                                )}
                            ></div>
                        </div>
                    ))}
                </div>
            </Portal>
            {children && (
                <div className={cn("px-4 sm:px-8 space-y-4", className)}>
                    {children}
                </div>
            )}
        </div>
    );
}
