"use client";

import { useEffect, useState } from "react";
import TabbedLayout from "./tabbed-layout";
import { useSession } from "next-auth/react";

export default function SalesTabLayout({
    children,
    query,
}: {
    children;
    query?;
}) {
    const { data: session } = useSession({
        required: false,
    });
    const can = session?.can;
    // useEffect(() =>)
    const [tabs, setTabs] = useState(
        [
            can?.viewOrders && { title: "Orders", path: "/sales/orders" },
            can?.viewOrders && {
                title: "Back Orders",
                path: "/sales/back-orders",
            },
            can?.viewOrders && { title: "Estimates", path: "/sales/estimates" },
            // can?.viewInboundOrder && {
            //     title: "Inbounds",
            //     path: "/sales/inbounds",
            // },
            can?.viewDelivery && {
                title: "Delivery",
                path: "/sales/delivery?_deliveryStatus=queued",
            },
            can?.viewDelivery && { title: "Pickup", path: "/sales/pickup" },
        ].filter(Boolean)
    );
    return <TabbedLayout tabs={tabs as any}>{children}</TabbedLayout>;
}
