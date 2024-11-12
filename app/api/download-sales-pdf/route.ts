import { printSalesPdf } from "@/app/(v1)/(loggedIn)/sales/_actions/save-pdf";
import { salesPdf } from "@/app/(v2)/printer/_action/sales-pdf";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const data = await req.json();

    const resp = await salesPdf(data);
    return new NextResponse(resp.pdf, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${data.slugs}.pdf"`,
        },
    });
}
