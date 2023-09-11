"use server";
import { env } from "@/env.mjs";
import puppeteer from "puppeteer";
export async function printSalesPdf() {
  const browser = await puppeteer.launch({});
  const url = env.NODE_ENV !== "production" ? `` : ``;
  const page = await browser.newPage();
  await page.goto(url);
  const pdf = await page.pdf({
    format: "A4",
    scale: 0.75,
    printBackground: true,
  });
  await browser.close();
  return pdf;
}
