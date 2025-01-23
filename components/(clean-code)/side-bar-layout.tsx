"use client";
import React, { useEffect } from "react";
import { useStore } from "../../app/(clean-code)/_common/hooks/use-store";
import { useSidebarToggle } from "../../app/(clean-code)/_common/hooks/use-sidebar-toggle";
import { Sidebar } from "./nav/sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useNavStore } from "./nav/store";
import { usePathname } from "next/navigation";
import { getMenuList } from "@/app/(clean-code)/_common/utils/get-menu-list";
export default function SidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const sidebar = useStore(useSidebarToggle, (state) => state);
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });
    const nav = useNavStore();
    const pathname = usePathname();
    useEffect(() => {
        const ls = getMenuList(pathname, session);

        nav.update("groupedMenu", ls);
    }, [pathname, session]);
    if (!session?.user) return <></>;
    // if (!sidebar) return null;

    return (
        <>
            {!nav.groupedMenu?.length || <Sidebar />}
            <main
                className={cn(
                    "min-h-[calc(100vh)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
                    !nav.groupedMenu?.length
                        ? ""
                        : nav?.isOpen === false
                        ? "lg:ml-[90px]"
                        : "lg:ml-72"
                )}
            >
                {children}
            </main>
        </>
    );
}
