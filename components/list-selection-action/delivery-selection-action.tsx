"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import useQueryParams from "@/lib/use-query-params";
import { useEffect } from "react";

export function DeliverySelectionAction({ items }) {
    const { queryParams, setQueryParams } = useQueryParams<any>();

    return (
        <>
            {queryParams?.get("_deliveryStatus") == "ready" && (
                <Button asChild size={"sm"} className="h-8">
                    <Link
                        href={`/sales/delivery/load?orderIds=${items.map(
                            ({ slug }) => slug
                        )}`}
                    >
                        <span>Load Orders</span>
                    </Link>
                </Button>
            )}
        </>
    );
}
