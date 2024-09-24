"use client";
import React from "react";
import { useStore } from "../hooks/use-store";
import { useSidebarToggle } from "../hooks/use-sidebar-toggle";
import { Sidebar } from "./nav/sidebar";
import { cn } from "@/lib/utils";

export default function SidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebar = useStore(useSidebarToggle, (state) => state);
    if (!sidebar) return null;

    return (
        <>
            <Sidebar />
            {/* min-h-[calc(100vh_-_56px)] with footer */}
            <main
                className={cn(
                    "min-h-[calc(100vh)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
                    sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-72"
                )}
            >
                {children}
            </main>
        </>
    );
}
