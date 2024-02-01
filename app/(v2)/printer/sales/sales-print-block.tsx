"use client";

import React from "react";
import { getSalesPrintData } from "./get-sales-print-data";

type SalesPrintData = Awaited<ReturnType<typeof getSalesPrintData>>;
interface Props {
    action: Promise<SalesPrintData>;
}
export default function SalesPrintBlock({ action }: Props) {
    const data = React.use(action);
    if (!data) return null;
    return <></>;
}
