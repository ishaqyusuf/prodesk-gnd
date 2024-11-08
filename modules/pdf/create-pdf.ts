import { AsyncFnType } from "@/app/(clean-code)/type";
import { logError } from "../error/report";

interface Props {
    list: {
        url?;
        pdfConfig?: PdfConfig;
    }[];
}
export type PdfConfig = {
    format: "Letter" | "A4";
    margin?: {
        left?;
        top?;
        right?;
        bottom?;
    };
    printBackground?: boolean;
};
export async function createPdf(props: Props) {
    const validList = props.list?.filter((l) => l.url);
    if (!validList?.length) {
        return {};
    }
    const ctx = await initChromium();
}
type Ctx = AsyncFnType<typeof initChromium>;
async function printPage(ctx: Ctx, pageData: Props["list"][number]) {
    try {
        await ctx.page.goto(pageData.url, {
            waitUntil: "networkidle0",
        });
        await ctx.page.emulateMediaType("print");
        const pdf = await ctx.page.pdf({
            format: "A4",
            printBackground: true,
        });
        return pdf;
    } catch (error) {
        await logError(error, "severe", ["chromium-aws", "pdf"]);
        throw Error("Error generating PDF with chrome-aws-lamba", error);
    }
}
async function initChromium() {
    const puppeteer = require("puppeteer-core");
    const chromium = require("chrome-aws-lambda");
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const page = await browser.newPage();
    return {
        page,
    };
}
