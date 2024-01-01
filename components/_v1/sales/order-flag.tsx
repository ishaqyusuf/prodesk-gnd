import { FlagIcon } from "lucide-react";
import React from "react";

import { ISalesOrder } from "@/types/sales";
import { orderPriorityColorMap } from "@/lib/sales/order-priority";
import { Icons } from "../icons";

export default function OrderFlag({ order }: { order: ISalesOrder }) {
  const [color, setColor] = React.useState("gray");
  React.useEffect(() => {
    setColor(orderPriorityColorMap[order.meta?.priority || "Non"]);
  }, [order, setColor]);

  return (
    <>
      <Icons.flag className={`h-5 w-5 text-${color}-500`} />
    </>
  );
}
