"use server";
import { env } from "@/env.mjs";
import { timeout } from "@/lib/timeout";
// import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
export async function printSalesPdf(mode, ids) {
    const browser = await chromium.puppeteer.launch({
        // headless: "new",
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true
    });
    const url =
        env.NODE_ENV !== "production"
            ? `http://localhost:3000/print-sales?id=${ids}&mode=${mode}`
            : `https://gnd-prodesk.vercel.app/print-sales?id=${ids}&mode=${mode}`;
    const page = await browser.newPage();
    // await page.goto(url);
    //   page.setContent(html);
    await page.goto(url, {
        waitUntil: "networkidle0"
    });

    // await page.waifo(5000);
    // await timeout(2000);
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
        format: "letter",
        margin: {
            left: "0.39in",
            top: "0.39in",
            right: "0.39in",
            bottom: "0.39in"
        },
        // scale: 0.75,
        printBackground: true
    });
    await browser.close();
    const pdfDataUri = `data:application/pdf;base64,${pdf.toString("base64")}`;
    return pdfDataUri;
}
