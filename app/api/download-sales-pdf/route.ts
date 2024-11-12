import { printSalesPdf } from "@/app/(v1)/(loggedIn)/sales/_actions/save-pdf";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const data = await req.json();

    const resp = await printSalesPdf(data.mode, data.ids);
    return new NextResponse(resp.pdf, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${resp.fileName}"`,
        },
    });
}
