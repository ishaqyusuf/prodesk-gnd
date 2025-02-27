import { salesPdf } from "@/app/(v2)/printer/_action/sales-pdf";
import { SalesPrintProps } from "@/app/(v2)/printer/sales/page";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = {
        slugs: searchParams.get("slug"),
        mode: searchParams.get("type"),
        preview: false,
    } as SalesPrintProps["searchParams"];

    const pdf = await salesPdf(query);

    const res = await fetch(pdf.url); // fetch actual pdf content
    const pdfBuffer = await res.arrayBuffer();

    return new Response(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${query.slugs}.pdf"`,
        },
    });
}

