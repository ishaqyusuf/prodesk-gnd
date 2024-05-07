"use client";

import TabbedLayout from "@/components/_v1/tab-layouts/tabbed-layout";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProductionPageTabs() {
    const { data: session } = useSession({
        required: false,
    });
    const can = session?.can;
    const [tabs, setTabs] = useState([
        { title: "Productions (v1)", path: "/sales/productions" },
        { title: "Productions (v2)", path: "/sales-v2/productions" },
    ]);
    return <TabbedLayout tabs={tabs} />;
}
