"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import useQueryParams from "@/lib/use-query-params";
import { useEffect } from "react";

export function DeliverySelectionAction({ items }) {
    const { queryParams, setQueryParams } = useQueryParams<any>();

    return (
        <>
            {queryParams?.get("_deliveryStatus") == "queued" && (
                <Button asChild size={"sm"} className="h-8">
                    <Link
                        href={`/sales/delivery/get-ready?orderIds=${items.map(
                            ({ slug }) => slug
                        )}`}
                    >
                        <span>Ready</span>
                    </Link>
                </Button>
            )}
        </>
    );
}
