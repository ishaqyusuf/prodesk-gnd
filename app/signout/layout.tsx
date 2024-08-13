"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import SiteHeader from "@/components/_v1/layouts/site-header";
import { nav } from "@/lib/navs";
import SiteNav from "@/components/_v1/layouts/site-nav";
import EmailComposerModal from "@/components/_v1/modals/email-composer-modal";
import Refresher from "@/components/_v1/refresher";

export default function AccountLayout({ children }: any) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });

    if (!session?.user) return <></>;
    // if (session.role?.name == "Dealer") redirect("/orders");
    let sb = nav(session);
    if (!sb) return;
    return <>{children}</>;
}
