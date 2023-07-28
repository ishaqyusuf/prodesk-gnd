import { FlagIcon } from "lucide-react";
import React from "react";

import { ISalesOrder } from "@/types/sales";
import { orderPriorityColorMap } from "@/lib/sales/order-priority";

export default function OrderFlag({ order }: { order: ISalesOrder }) {
  const [color, setColor] = React.useState("gray");
  React.useEffect(() => {
    setColor(orderPriorityColorMap[order.meta?.priority || "Non"]);
  }, [order, setColor]);

  return (
    <>
      <FlagIcon className={`h-4 w-4 text-${color}-500`} />
    </>
  );
}
