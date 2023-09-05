"use server";

import { env } from "@/env.mjs";

export const isProduction = async () => env.NODE_ENV === "production";
