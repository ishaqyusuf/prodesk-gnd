"use server";
import { env } from "@/env.mjs";
import puppeteer from "puppeteer";
export async function printSalesPdf() {
  const browser = await puppeteer.launch({});
  const url =
    env.NODE_ENV !== "production" ? `http://localhost:3000/print-sales` : ``;
  const page = await browser.newPage();
  await page.goto(url);
  const pdf = await page.pdf({
    format: "A4",
    scale: 0.75,
    printBackground: true,
  });
  await browser.close();
  const pdfDataUri = `data:application/pdf;base64,${pdf.toString("base64")}`;
  return pdfDataUri;
}
