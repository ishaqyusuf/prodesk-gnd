"use client";

import { SalesPrintProps } from "./page";
import { salesPdf } from "../_action/sales-pdf";
import { toast } from "sonner";
import QueryString from "qs";

export default function useSalesPdf() {
    async function print(query: SalesPrintProps["searchParams"]) {
        // console.log(query);
        // QueryString.stringify(query)
        const resp = await fetch(
            `/api/download-sales-pdf?mode=${QueryString.stringify(query)}`
        );
        // const pdf = await salesPdf(query);
        // const link = document.createElement("a");
        // link.href = pdf.uri;
        // link.download = `${query.slugs}.pdf`;
        // link.click();
        toast.success("Pdf Exported!.");
    }
    return {
        print,
    };
}
