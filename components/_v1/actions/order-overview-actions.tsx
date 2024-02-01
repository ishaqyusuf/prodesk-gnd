"use client";

import Link from "next/link";
import { Button } from "../../ui/button";
import { Pencil } from "lucide-react";
import { OrderRowAction } from "./order-actions";
import { ISalesOrder } from "@/types/sales";
import { useAppSelector } from "@/store";
import UpdateSalesDate from "../sales/update-sales-date";
import { useDataPage } from "@/lib/data-page-context";

interface Props {
    estimate?: Boolean;
}
export default function OrderOverviewActions({ estimate }: Props) {
    const { data: order } = useDataPage<ISalesOrder>();
    // const _linkDir = `/sales/${order?.type || "order"}/${order.orderId}/form`;
    const _linkDir = order.isDyke
        ? `/sales-v2/form/${order.type}/${order.slug}`
        : `/sales/edit/${order.type}/${order.slug}`;
    return (
        <div className="flex space-x-2">
            {/* <UpdateSalesDate sales={order} /> */}
            <Link className="hidden sm:block" href={_linkDir}>
                <Button className="h-8 w-8 p-0" variant="outline">
                    <Pencil className="h-4 w-4" />
                </Button>
            </Link>
            <OrderRowAction row={order} estimate={estimate} viewMode />
        </div>
    );
}
