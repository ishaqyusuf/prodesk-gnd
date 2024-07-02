"use client";

import useSalesPdf from "@/app/(v2)/printer/sales/use-sales-pdf";
import { Button } from "@/components/ui/button";

export default function SalesDownload({ id, mode }) {
    const pdf = useSalesPdf();
    async function download() {
        pdf.print({
            slugs: id,
            mode: mode as any,
            pdf: true,
        });
    }
    return (
        <>
            <Button onClick={download}>Download</Button>
        </>
    );
}
