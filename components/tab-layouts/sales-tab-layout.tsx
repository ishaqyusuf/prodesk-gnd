"use client";

import { useEffect, useState } from "react";
import TabbedLayout from "./tabbed-layout";

export default function SalesTabLayout({ children }: { children }) {
  const [tabs, setTabs] = useState([
    { title: "Orders", path: "/sales/orders" },
    { title: "Estimates", path: "/sales/estimates" },
    { title: "Delivery", path: "/sales/delivery" },
  ]);
  return <TabbedLayout tabs={tabs}>{children}</TabbedLayout>;
}
