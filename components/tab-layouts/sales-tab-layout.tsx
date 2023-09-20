"use client";

import { useEffect, useState } from "react";
import TabbedLayout from "./tabbed-layout";

export default function SalesTabLayout({
  children,
  query,
}: {
  children;
  query?;
}) {
  // console.log(query);
  const [tabs, setTabs] = useState([
    { title: "Orders", path: "/sales/orders" },
    { title: "Estimates", path: "/sales/estimates" },
    { title: "Delivery", path: "/sales/delivery" },
  ]);
  console.log("SALES TAB");
  return <TabbedLayout tabs={tabs}>{children}</TabbedLayout>;
}
