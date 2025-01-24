import { cn } from "@/lib/utils";

import { SidebarToggle } from "./sidebar-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Menu from "./menu";
import { Icons } from "@/components/_v1/icons";
import { siteNavStore } from "../site-nav/store";

export function Sidebar() {
    const store = siteNavStore();
    if (!store.showSideNav) return null;
    return (
        <aside
            className={cn(
                "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
                store?.sideNavOpened === false ? "w-[90px]" : "w-72"
            )}
        >
            <SidebarToggle
                isOpen={store.sideNavOpened}
                setIsOpen={store.toggleSideNav as any}
            />
            <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
                <Button
                    className={cn(
                        "transition-transform ease-in-out duration-300 mb-1",
                        store.sideNavOpened === false
                            ? "translate-x-1"
                            : "translate-x-0"
                    )}
                    variant="ghost"
                    asChild
                >
                    <Link href="/dashboard" className="flex items-center gap-2">
                        {!store.sideNavOpened ? (
                            <Icons.Logo />
                        ) : (
                            <Icons.LogoLg />
                        )}
                    </Link>
                </Button>
                <Menu isOpen={store.sideNavOpened} />
            </div>
        </aside>
    );
}
