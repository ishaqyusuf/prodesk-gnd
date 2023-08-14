"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import { OrderRowAction } from "./order-actions";
import { ISalesOrder } from "@/types/sales";
import { useAppSelector } from "@/store";

interface Props {}
export default function OrderOverviewActions({}: Props) {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  const _linkDir = `/sales/${order?.type || "order"}/${order.orderId}/form`;
  return (
    <div className="flex space-x-2">
      <Link className="hidden sm:block" href={_linkDir}>
        <Button className="h-8 w-8 p-0" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <OrderRowAction row={order} viewMode />
    </div>
  );
}
