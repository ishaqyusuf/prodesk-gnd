"use client";
import { env } from "@/env.mjs";
import QueryString from "qs";

export function openLink(path, query = {}, newTab = false) {
    const link = document.createElement("a");
    let base = env.NEXT_PUBLIC_APP_URL;
    if (newTab) link.target = "_blank";
    link.href = `${base}/${path}?${QueryString.stringify(query)}`;
    link.click();
}
