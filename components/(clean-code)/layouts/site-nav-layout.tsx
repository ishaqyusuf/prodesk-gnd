"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { siteNavStore } from "../site-nav/store";
import { composeSiteNav } from "../site-nav/utils";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteSidebarNav } from "../site-nav/side-bar";
import { NavHeader } from "../site-nav/nav-header";

export default function SiteNavLayout({ children }) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });
    const store = siteNavStore();
    useEffect(() => {
        if (!session) store.reset();
        else {
            composeSiteNav(session);
        }
    }, [session]);
    return (
        <SidebarProvider>
            <SiteSidebarNav></SiteSidebarNav>
            <SidebarInset>
                <NavHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
